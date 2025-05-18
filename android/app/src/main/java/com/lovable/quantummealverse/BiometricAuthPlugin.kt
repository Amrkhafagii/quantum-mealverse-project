
package com.lovable.quantummealverse

import android.content.Context
import android.os.Build
import androidx.biometric.BiometricManager
import androidx.biometric.BiometricPrompt
import androidx.core.content.ContextCompat
import androidx.fragment.app.FragmentActivity
import com.getcapacitor.JSObject
import com.getcapacitor.Plugin
import com.getcapacitor.PluginCall
import com.getcapacitor.PluginMethod
import com.getcapacitor.annotation.CapacitorPlugin
import java.util.concurrent.Executor
import androidx.biometric.BiometricPrompt.PromptInfo
import android.security.keystore.KeyGenParameterSpec
import android.security.keystore.KeyProperties
import java.security.KeyStore
import javax.crypto.Cipher
import javax.crypto.KeyGenerator
import javax.crypto.SecretKey

@CapacitorPlugin(name = "BiometricAuth")
class BiometricAuthPlugin : Plugin() {
    private lateinit var executor: Executor
    private lateinit var biometricPrompt: BiometricPrompt
    private val keyStore = KeyStore.getInstance("AndroidKeyStore").apply { load(null) }
    private val keyName = "biometric_encryption_key"
    
    @PluginMethod
    fun isAvailable(call: PluginCall) {
        val biometricManager = BiometricManager.from(context)
        val result = JSObject()
        
        when (biometricManager.canAuthenticate(BiometricManager.Authenticators.BIOMETRIC_STRONG)) {
            BiometricManager.BIOMETRIC_SUCCESS -> {
                result.put("available", true)
                
                // Determine biometry type - simplified for this example
                val biometryType = if (hasFaceID()) "faceId" else "fingerprint"
                result.put("biometryType", biometryType)
            }
            else -> {
                result.put("available", false)
                result.put("biometryType", "none")
            }
        }
        
        call.resolve(result)
    }
    
    @PluginMethod
    fun authenticate(call: PluginCall) {
        val activity = activity as FragmentActivity? ?: run {
            call.reject("Activity not available")
            return
        }
        
        val reason = call.getString("reason") ?: "Authentication required"
        val title = call.getString("title") ?: "Authentication"
        
        executor = ContextCompat.getMainExecutor(context)
        biometricPrompt = BiometricPrompt(activity, executor,
            object : BiometricPrompt.AuthenticationCallback() {
                override fun onAuthenticationError(errorCode: Int, errString: CharSequence) {
                    super.onAuthenticationError(errorCode, errString)
                    val result = JSObject()
                    result.put("authenticated", false)
                    result.put("error", errString.toString())
                    call.resolve(result)
                }

                override fun onAuthenticationSucceeded(result: BiometricPrompt.AuthenticationResult) {
                    super.onAuthenticationSucceeded(result)
                    val jsResult = JSObject()
                    jsResult.put("authenticated", true)
                    call.resolve(jsResult)
                }

                override fun onAuthenticationFailed() {
                    super.onAuthenticationFailed()
                    // This is called when authentication fails, but there are still attempts left
                    // We'll wait for onAuthenticationError for final failure
                }
            })
            
        val promptInfo = PromptInfo.Builder()
            .setTitle(title)
            .setSubtitle(reason)
            .setNegativeButtonText("Cancel")
            .setAllowedAuthenticators(BiometricManager.Authenticators.BIOMETRIC_STRONG)
            .build()
            
        biometricPrompt.authenticate(promptInfo)
    }
    
    @PluginMethod
    fun setupBiometricLogin(call: PluginCall) {
        val userId = call.getString("userId") ?: run {
            call.reject("Missing userId parameter")
            return
        }
        val token = call.getString("token") ?: run {
            call.reject("Missing token parameter")
            return
        }
        
        try {
            // Save the user ID for later retrieval
            context.getSharedPreferences("biometric_prefs", Context.MODE_PRIVATE)
                .edit()
                .putString("biometric_user_id", userId)
                .apply()
            
            // Generate or retrieve the encryption key
            val key = getOrCreateSecretKey()
            
            // Store the encrypted token
            val encryptedToken = encryptToken(token, key)
            
            // Store encrypted token in shared preferences
            context.getSharedPreferences("biometric_prefs", Context.MODE_PRIVATE)
                .edit()
                .putString("encrypted_token_$userId", encryptedToken)
                .apply()
                
            val result = JSObject()
            result.put("success", true)
            call.resolve(result)
        } catch (e: Exception) {
            call.reject("Failed to setup biometric login: ${e.message}")
        }
    }
    
    private fun hasFaceID(): Boolean {
        // This is a simplified check - in a real app, you would use
        // PackageManager.FEATURE_FACE or other methods to determine this
        return Build.VERSION.SDK_INT >= Build.VERSION_CODES.Q
    }
    
    private fun getOrCreateSecretKey(): SecretKey {
        if (!keyStore.containsAlias(keyName)) {
            val keyGenerator = KeyGenerator.getInstance(
                KeyProperties.KEY_ALGORITHM_AES,
                "AndroidKeyStore"
            )
            keyGenerator.init(
                KeyGenParameterSpec.Builder(
                    keyName,
                    KeyProperties.PURPOSE_ENCRYPT or KeyProperties.PURPOSE_DECRYPT
                )
                .setBlockModes(KeyProperties.BLOCK_MODE_CBC)
                .setEncryptionPaddings(KeyProperties.ENCRYPTION_PADDING_PKCS7)
                .setUserAuthenticationRequired(true)
                .build()
            )
            return keyGenerator.generateKey()
        }
        
        return keyStore.getKey(keyName, null) as SecretKey
    }
    
    private fun encryptToken(token: String, key: SecretKey): String {
        // This is a simplified implementation - in a real app you would use
        // proper encryption and handle IV properly
        val cipher = Cipher.getInstance(
            "${KeyProperties.KEY_ALGORITHM_AES}/${KeyProperties.BLOCK_MODE_CBC}/${KeyProperties.ENCRYPTION_PADDING_PKCS7}"
        )
        cipher.init(Cipher.ENCRYPT_MODE, key)
        
        val encryptedBytes = cipher.doFinal(token.toByteArray())
        return android.util.Base64.encodeToString(encryptedBytes, android.util.Base64.DEFAULT)
    }
}
