package com.example.shopro_pos_flutter

import io.flutter.embedding.android.FlutterActivity
import io.flutter.embedding.engine.FlutterEngine
import io.flutter.plugin.common.MethodChannel
import android.util.Log
import com.nexgo.oaf.apiv3.APIProxy
import com.nexgo.oaf.apiv3.DeviceEngine
import com.nexgo.oaf.apiv3.device.printer.Printer
import com.nexgo.oaf.apiv3.device.printer.AlignEnum
import com.nexgo.oaf.apiv3.device.printer.FontEntity
import com.nexgo.oaf.apiv3.device.printer.FontSizeEnum

class MainActivity: FlutterActivity() {
    private val CHANNEL = "com.shopro.pos/hardware"
    private var printer: Printer? = null

    override fun configureFlutterEngine(flutterEngine: FlutterEngine) {
        super.configureFlutterEngine(flutterEngine)
        
        // Initialize NEXGO Device Engine
        try {
            val deviceEngine = APIProxy.getDeviceEngine(this)
            printer = deviceEngine.getPrinter()
            Log.d("NEXGO", "Printer initialized: ${printer != null}")
        } catch (e: Exception) {
            Log.e("NEXGO", "Failed to initialize NEXGO SDK: ${e.message}")
        }

        MethodChannel(flutterEngine.dartExecutor.binaryMessenger, CHANNEL).setMethodCallHandler { call, result ->
            if (call.method == "printReceipt") {
                val commands = call.argument<List<Map<String, Any>>>("commands")
                if (commands != null) {
                    executePrint(commands, result)
                } else {
                    result.error("INVALID_ARGUMENT", "Commands missing", null)
                }
            } else {
                result.notImplemented()
            }
        }
    }

    private fun executePrint(commands: List<Map<String, Any>>, result: MethodChannel.Result) {
        val p = printer ?: run {
            result.error("PRINTER_ERROR", "Printer not initialized", null)
            return
        }

        p.init()
        
        for (cmd in commands) {
            val type = cmd["type"] as? String ?: continue
            when (type) {
                "TEXT" -> {
                    val content = cmd["content"] as? String ?: ""
                    val isBold = cmd["isBold"] as? Boolean ?: false
                    val isCentered = cmd["isCentered"] as? Boolean ?: false
                    val isSmall = cmd["isSmall"] as? Boolean ?: false
                    
                    p.appendPrintRawData(content, FontEntity().apply {
                        this.isBold = isBold
                        this.fontSize = if (isSmall) FontSizeEnum.SMALL else FontSizeEnum.MIDDLE
                    }, if (isCentered) AlignEnum.CENTER else AlignEnum.LEFT)
                }
                "LINE" -> {
                    val left = cmd["left"] as? String ?: ""
                    val right = cmd["right"] as? String ?: ""
                    val isBold = cmd["isBold"] as? Boolean ?: false
                    
                    // Simple alignment for NEXGO (32-42 chars depending on font)
                    val line = formatLine(left, right, 32)
                    p.appendPrintRawData(line, FontEntity().apply { this.isBold = isBold }, AlignEnum.LEFT)
                }
                "DIVIDER" -> {
                    p.appendPrintRawData("--------------------------------", FontEntity(), AlignEnum.CENTER)
                }
                "CUT" -> {
                    p.cutPaper()
                }
            }
        }

        p.startPrint(true) { code ->
            if (code == 0) {
                result.success(true)
            } else {
                result.error("PRINT_FAILED", "Code: $code", null)
            }
        }
    }

    private fun formatLine(left: String, right: String, width: Int): String {
        val spaceCount = width - left.length - right.length
        if (spaceCount <= 0) return "$left $right"
        return left + " ".repeat(spaceCount) + right
    }
}
