#!/usr/bin/env python3
"""
Simulation Watchdog - Monitors traffic_simulator.py and detects stuck processes
"""
import subprocess, sys, time, signal, os

WATCHDOG_TIMEOUT = 30  # seconds without progress before interrupt
CHECK_INTERVAL = 5     # check every 5 seconds

def main():
    sim_cmd = sys.argv[1:]
    if not sim_cmd:
        print("Usage: python3 watchdog_sim.py python3 traffic_simulator.py [args...]")
        sys.exit(1)
    
    print(f"👀 Watchdog monitoring: {' '.join(sim_cmd)}")
    print(f"   Timeout: {WATCHDOG_TIMEOUT}s without progress")
    print("="*60)
    
    # Start simulation
    proc = subprocess.Popen(
        sim_cmd,
        stdout=subprocess.PIPE,
        stderr=subprocess.STDOUT,
        text=True,
        bufsize=1
    )
    
    last_output_time = time.time()
    last_line = ""
    stuck_count = 0
    
    try:
        while True:
            line = proc.stdout.readline()
            if not line and proc.poll() is not None:
                break
            
            if line:
                print(line, end='')
                sys.stdout.flush()
                
                # Check for progress indicators
                if '%' in line or 'Orders:' in line or 'Day' in line:
                    last_output_time = time.time()
                    last_line = line.strip()
                    stuck_count = 0
                elif not line.startswith('  ['):
                    # Non-progress output also resets timer
                    last_output_time = time.time()
            
            # Check if stuck
            elapsed = time.time() - last_output_time
            if elapsed > WATCHDOG_TIMEOUT:
                stuck_count += 1
                if stuck_count >= 1:
                    print(f"\n⚠️  WATCHDOG: No progress for {elapsed:.0f}s!")
                    print(f"   Last output: {last_line[:100]}...")
                    
                    # Check server health
                    import requests
                    try:
                        r = requests.get("http://localhost:8080/actuator/health", timeout=5)
                        if r.status_code == 200:
                            print("   ✅ Server is UP")
                        else:
                            print(f"   ❌ Server health: {r.status_code}")
                    except Exception as e:
                        print(f"   ❌ Server unreachable: {e}")
                    
                    # Check for errors in recent output
                    print(f"\n🔍 Interrupting simulation to check server logs...")
                    proc.send_signal(signal.SIGINT)
                    time.sleep(2)
                    if proc.poll() is None:
                        proc.terminate()
                    return 1
            
            # Check if process died
            if proc.poll() is not None:
                break
                
    except KeyboardInterrupt:
        print("\n⚠️  Interrupted by user")
        proc.terminate()
    
    # Wait for completion
    proc.wait()
    print(f"\n✅ Simulation completed with code {proc.returncode}")
    return proc.returncode

if __name__ == "__main__":
    sys.exit(main())
