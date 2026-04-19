#!/usr/bin/env bash
# Extract errors and warnings from the Shopro POS server log
# Usage: ./extract-errors.sh [lines] [log_path]
#   lines    — number of recent lines to scan (default: 1000)
#   log_path — path to log file (default: shopro-res/logs/sabz-server.log)
#
# Captures: ERROR, WARN, and notable INFO lines (containing keywords like
# "could not", "exception", "failed", etc.)

set -euo pipefail

LINES="${1:-1000}"
LOG_PATH="${2:-shopro-res/logs/sabz-server.log}"
PROJECT_ROOT="/home/arun/IdeaProjects/shopro-pos"

cd "$PROJECT_ROOT"

if [ ! -f "$LOG_PATH" ]; then
    echo "{\"count\": 0, \"log_file\": \"$LOG_PATH\", \"note\": \"Log file not found — server may not have been started yet\", \"exceptions\": []}"
    exit 0
fi

python3 - "$LINES" "$LOG_PATH" << 'PYTHON'
import sys, json, re

lines_to_read = int(sys.argv[1])
log_path = sys.argv[2]

try:
    with open(log_path, 'r', errors='replace') as f:
        all_lines = f.readlines()
except FileNotFoundError:
    print(json.dumps({"count": 0, "log_file": log_path, "exceptions": []}))
    sys.exit(0)

recent = all_lines[-lines_to_read:] if lines_to_read < len(all_lines) else all_lines

# ── Log format patterns ──
# Format 1: 2026-04-18T15:49:47.032+05:30  INFO 1770047 --- [shopro-pos-server] [          main] .RepositoryConfigurationExtensionSupport : message
# Format 2: 2026-04-18T15:49:47.032+05:30  INFO 1770047 --- [main] .RepositoryConfigurationExtensionSupport : message

log_pattern_v1 = re.compile(
    r'^(\d{4}-\d{2}-\d{2}[T ]\d{2}:\d{2}:\d{2}[.,]?\d{0,3}(?:[+-]\d{2}:\d{2})?)\s+'
    r'(ERROR|WARN|INFO|DEBUG|TRACE)\s+'
    r'(\d+)\s+'
    r'---\s+'
    r'\[([^\]]+)\]\s+'
    r'\[([^\]]+)\]\s+'
    r'(\S+)\s+'
    r':\s*(.*)'
)

log_pattern_v2 = re.compile(
    r'^(\d{4}-\d{2}-\d{2}[T ]\d{2}:\d{2}:\d{2}[.,]?\d{0,3}(?:[+-]\d{2}:\d{2})?)\s+'
    r'(ERROR|WARN|INFO|DEBUG|TRACE)\s+'
    r'(\d+)\s+'
    r'---\s+'
    r'(?:\[([^\]]*)\]\s+)?'
    r'(\S+)\s+'
    r':\s*(.*)'
)

# ── Notable keywords in INFO/WARN messages ──
notable_keywords = [
    'could not', 'cannot', 'exception', 'error', 'failed', 'failure',
    'unable', 'conflict', 'not found', 'missing', 'deprecated',
    'not recommend', 'upgrade recommended', 'resolved [',
]

# Noise patterns — INFO lines that look notable but aren't actionable
noise_patterns = [
    re.compile(r'Will secure any request with', re.IGNORECASE),           # Spring Security filter chain listing
    re.compile(r'Exposing \d+ endpoint', re.IGNORECASE),               # Actuator endpoint listing
    re.compile(r'Second-level cache (disabled|enabled)', re.IGNORECASE), # Hibernate cache info
    re.compile(r'Processing PersistenceUnitInfo', re.IGNORECASE),        # JPA startup info
    re.compile(r'HHH000412: Hibernate ORM core version', re.IGNORECASE),# Hibernate version info
    re.compile(r'No JTA platform available', re.IGNORECASE),            # JTA info
    re.compile(r'Hibernate is in classpath', re.IGNORECASE),            # QueryEnhancerFactory info
    re.compile(r'WebSocketSession\[', re.IGNORECASE),                 # WebSocket stats
]

# ── Stack trace patterns ──
exception_class_pattern = re.compile(r'^([a-zA-Z.]+(?:Exception|Error|Fault)):\s*(.*)')
at_pattern = re.compile(r'^\s+at\s+(.*)')
caused_by_pattern = re.compile(r'^Caused by:\s*([a-zA-Z.]+(?:Exception|Error|Fault)):\s*(.*)')

def is_notable(level, message):
    """Determine if a log line is worth reporting."""
    if level in ('ERROR', 'WARN'):
        return True
    if level == 'INFO':
        # Filter out known noise patterns first
        for pattern in noise_patterns:
            if pattern.search(message):
                return False
        msg_lower = message.lower()
        return any(kw in msg_lower for kw in notable_keywords)
    return False

def classify_issue(level, logger, message):
    """Classify the severity category for prioritization."""
    msg_lower = message.lower()
    
    # Specific WARN-level categorization (before generic Exception check)
    if level == 'WARN':
        if 'MissingServletRequestParameter' in message:
            return 'api_issue'
        if 'deprecated' in msg_lower or 'deprecation' in msg_lower:
            return 'deprecation'
        if 'open-in-view' in msg_lower:
            return 'config'
        if 'template' in msg_lower or 'thymeleaf' in msg_lower:
            return 'config'
        if 'flyway' in msg_lower or 'database' in msg_lower:
            return 'db_warning'
        # Generic WARN with exception — still a warning, not critical
        return 'warning'
    
    # ERROR level
    if level == 'ERROR':
        return 'critical'
    
    # Any message containing Exception/Error at other levels
    if 'Exception' in message or 'exception' in message:
        return 'critical'
    
    # Notable INFO messages (Spring Data, Bean conflicts, etc.)
    if 'could not' in msg_lower or 'cannot' in msg_lower:
        return 'config'
    if 'deprecated' in msg_lower:
        return 'deprecation'
    
    return 'info'

def parse_log_line(line):
    """Parse a Spring Boot log line into structured fields."""
    m = log_pattern_v1.match(line)
    if m:
        return m.group(1), m.group(2), m.group(3), m.group(4), m.group(5), m.group(6), m.group(7)
    m = log_pattern_v2.match(line)
    if m:
        app = m.group(4) or ''
        thread = ''
        logger = m.group(5)
        message = m.group(6)
        return m.group(1), m.group(2), m.group(3), app, thread, logger, message
    return None

exceptions = []
current_exception = None
in_stack_trace = False

for i, line in enumerate(recent):
    line = line.rstrip('\n')
    parsed = parse_log_line(line)
    
    if parsed:
        timestamp, level, pid, app, thread, logger, message = parsed
        
        if is_notable(level, message):
            # Flush previous exception
            if current_exception:
                exceptions.append(current_exception)
            
            # Detect exception class in the message
            ex_match = exception_class_pattern.match(message)
            error_type = ex_match.group(1) if ex_match else ''
            
            # Also extract from Spring Resolved [...] pattern:
            #   Resolved [org.springframework.web.bind.MissingServletRequestParameterException: ...
            resolved_match = re.search(r'Resolved \[([a-zA-Z.]+(?:Exception|Error)):', message)
            if resolved_match and not error_type:
                error_type = resolved_match.group(1).split('.')[-1]  # Short class name
                
            # Extract short message from Resolved pattern
            if resolved_match and ':' in message:
                # Get the part after the exception class colon
                after_class = message.split(':', 1)[-1].strip().rstrip(']')
                if after_class:
                    error_message_override = after_class
                else:
                    error_message_override = message
            else:
                error_message_override = message
            
            # Strip the abbreviated logger name (Spring abbreviates package segments)
            # e.g. ".RepositoryConfigurationExtensionSupport" → "RepositoryConfigurationExtensionSupport"
            clean_logger = logger.lstrip('.')
            
            # Classify the issue
            category = classify_issue(level, logger, message)
            
            current_exception = {
                'event_type': 'exception_detected',
                'timestamp': timestamp,
                'level': level,
                'category': category,
                'error_type': error_type,
                'error_message': error_message_override,
                'service': clean_logger,
                'app': app,
                'pid': pid,
                'thread': thread.strip(),
                'full_log_line': line,
                'context_lines': [
                    recent[j].rstrip('\n') for j in range(max(0, i-3), i)
                ],
                'stack_trace_lines': []
            }
            in_stack_trace = True
        
        elif in_stack_trace:
            # Non-notable log line ends the current stack trace collection
            in_stack_trace = False
    
    elif current_exception and in_stack_trace:
        # Continuation line (stack frame or Caused by)
        at_match = at_pattern.match(line)
        caused_match = caused_by_pattern.match(line)
        ex_match = exception_class_pattern.match(line)
        
        if at_match:
            current_exception['stack_trace_lines'].append(line)
        elif caused_match:
            current_exception['error_type'] = caused_match.group(1) + ' (Caused by)'
            current_exception['error_message'] = caused_match.group(2)
            current_exception['stack_trace_lines'].append(line)
        elif ex_match and not current_exception['error_type']:
            current_exception['error_type'] = ex_match.group(1)
            current_exception['error_message'] = ex_match.group(2) or current_exception['error_message']
            current_exception['stack_trace_lines'].append(line)

# Flush last exception
if current_exception:
    exceptions.append(current_exception)

# ── Deduplicate (keep most recent occurrence per unique issue) ──
seen = set()
deduped = []
for exc in reversed(exceptions):
    key = (exc.get('error_type', ''), exc.get('error_message', '')[:200])
    if key not in seen:
        seen.add(key)
        deduped.append(exc)

deduped.reverse()

# ── Summary stats ──
critical_count = sum(1 for e in deduped if e.get('category') == 'critical')
warning_count = sum(1 for e in deduped if e.get('category') in ('warning', 'api_issue', 'db_warning'))
config_count = sum(1 for e in deduped if e.get('category') == 'config')
deprecation_count = sum(1 for e in deduped if e.get('category') == 'deprecation')

result = {
    'count': len(deduped),
    'log_file': log_path,
    'lines_scanned': lines_to_read,
    'total_lines': len(all_lines),
    'summary': {
        'critical': critical_count,
        'warnings': warning_count,
        'config_issues': config_count,
        'deprecations': deprecation_count,
    },
    'exceptions': deduped
}
print(json.dumps(result, indent=2))
PYTHON