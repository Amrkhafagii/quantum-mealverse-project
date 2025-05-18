
package com.lovable.quantummealverse

import android.Manifest
import android.content.pm.PackageManager
import android.util.Log
import androidx.core.app.ActivityCompat
import androidx.core.content.ContextCompat
import com.getcapacitor.JSObject
import com.getcapacitor.Plugin
import com.getcapacitor.PluginCall
import com.getcapacitor.PluginMethod
import com.getcapacitor.annotation.CapacitorPlugin
import com.google.ar.core.ArCoreApk
import com.google.ar.core.Session
import com.google.ar.core.exceptions.UnavailableException

@CapacitorPlugin(name = "ARPreviewPlugin")
class ARPreviewPlugin : Plugin() {
    private var arSession: Session? = null
    private val CAMERA_PERMISSION_CODE = 0
    private var pendingCall: PluginCall? = null
    
    @PluginMethod
    fun isSupported(call: PluginCall) {
        val availability = ArCoreApk.getInstance().checkAvailability(context)
        val supported = availability.isSupported
        
        val ret = JSObject()
        ret.put("supported", supported)
        call.resolve(ret)
    }
    
    @PluginMethod
    fun startARSession(call: PluginCall) {
        // Check camera permission first
        if (ContextCompat.checkSelfPermission(context, Manifest.permission.CAMERA) != PackageManager.PERMISSION_GRANTED) {
            pendingCall = call
            ActivityCompat.requestPermissions(
                activity, 
                arrayOf(Manifest.permission.CAMERA), 
                CAMERA_PERMISSION_CODE
            )
            return
        }
        
        try {
            if (arSession == null) {
                arSession = Session(context)
            }
            call.resolve()
        } catch (e: UnavailableException) {
            Log.e("ARPreviewPlugin", "Error creating AR session", e)
            call.reject("Failed to create AR session: " + e.message)
        }
    }
    
    @PluginMethod
    fun loadModel(call: PluginCall) {
        val modelUrl = call.getString("modelUrl") ?: run {
            call.reject("Model URL is required")
            return
        }
        
        val scale = call.getFloat("scale") ?: 1.0f
        
        // In a real implementation, we would load the model here
        // This is just a stub to show the structure
        
        val ret = JSObject()
        ret.put("success", true)
        call.resolve(ret)
    }
    
    @PluginMethod
    fun placeModel(call: PluginCall) {
        if (arSession == null) {
            call.reject("AR session not initialized")
            return
        }
        
        // In a real implementation, we would place the model in the AR scene
        call.resolve()
    }
    
    @PluginMethod
    fun stopARSession(call: PluginCall) {
        arSession?.close()
        arSession = null
        call.resolve()
    }
    
    override fun handleRequestPermissionsResult(requestCode: Int, permissions: Array<String>, grantResults: IntArray) {
        super.handleRequestPermissionsResult(requestCode, permissions, grantResults)
        
        if (requestCode == CAMERA_PERMISSION_CODE) {
            val pendingCall = this.pendingCall ?: return
            
            if (grantResults.isNotEmpty() && grantResults[0] == PackageManager.PERMISSION_GRANTED) {
                // Permission granted, retry starting AR session
                startARSession(pendingCall)
            } else {
                pendingCall.reject("Camera permission denied")
            }
            
            this.pendingCall = null
        }
    }
}
