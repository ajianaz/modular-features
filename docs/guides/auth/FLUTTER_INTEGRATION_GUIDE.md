# 🎯 Flutter Integration Guide - Better Auth + Keycloak

Complete guide for integrating Flutter mobile app with Hybrid Better Auth + Keycloak authentication.

---

## 📋 Table of Contents

1. [Architecture Overview](#architecture-overview)
2. [Prerequisites](#prerequisites)
3. [Flutter Package Setup](#flutter-package-setup)
4. [OAuth Integration](#oauth-integration)
5. [JWT Token Management](#jwt-token-management)
6. [API Authentication](#api-authentication)
7. [Complete Example](#complete-example)
8. [Testing](#testing)

---

## 🏗️ Architecture Overview

### Flutter App Flow

```
Flutter App
    ↓ 1. User taps login
flutter_appauth (OAuth)
    ↓ 2. OAuth flow to Better Auth → Keycloak
Better Auth (Gateway)
    ↓ 3. Callback with JWT
Keycloak (IdP/SoT)
    ↓ 4. Returns to Flutter
Flutter App receives JWT
    ↓ 5. Stores JWT securely
    ↓ 6. Uses JWT for API calls
```

---

## 📦 Prerequisites

### Backend Requirements
- ✅ Better Auth + Keycloak running
- ✅ Backend URL: `https://api.yourdomain.com`
- ✅ Auth endpoints configured

### Flutter Requirements
- ✅ Flutter SDK >= 3.0
- ✅ Dart SDK >= 3.0
- ✅ iOS/Android configured

---

## 🔧 Flutter Package Setup

### pubspec.yaml

```yaml
dependencies:
  flutter:
    sdk: flutter
  
  # HTTP client
  http: ^1.1.0
  
  # Secure storage
  flutter_secure_storage: ^9.0.0
  
  # OAuth authentication
  flutter_appauth: ^6.0.0
  
  # JWT decoding
  jwt_decoder: ^2.0.1
  
  # State management (optional)
  provider: ^6.1.0
  riverpod: ^2.4.0
```

### Install Packages

```bash
flutter pub get
```

---

## 🔐 OAuth Integration

### Step 1: Configure OAuth

**File:** `lib/config/auth_config.dart`

```dart
class AuthConfig {
  // Backend configuration
  static const String baseUrl = 'https://api.yourdomain.com';
  static const String authUrl = '$baseUrl/api/auth';
  
  // OAuth configuration
  static const String clientId = 'modular-monolith-better-auth';
  static const String redirectUrl = 'com.yourapp://oauth/callback';
  static const String discoveryUrl = 
    'https://auth.azfirazka.com/realms/azfirazka/.well-known/openid-configuration';
  
  // JWT configuration
  static const String jwtIssuer = 'modular-monolith-better-auth';
  static const int jwtExpirationBuffer = 300; // 5 minutes before expiration
}
```

---

### Step 2: Create Authentication Service

**File:** `lib/services/auth_service.dart`

```dart
import 'package:flutter_appauth/flutter_appauth.dart';
import 'package:flutter_secure_storage/flutter_secure_storage.dart';
import 'package:http/http.dart' as http;
import 'package:jwt_decoder/jwt_decoder.dart';
import 'dart:convert';
import '../config/auth_config.dart';

class AuthService {
  final FlutterAppAuth _appAuth = FlutterAppAuth();
  final FlutterSecureStorage _secureStorage = const FlutterSecureStorage();
  
  // Get current JWT token
  Future<String?> getAccessToken() async {
    return await _secureStorage.read(key: 'access_token');
  }
  
  // Get refresh token
  Future<String?> getRefreshToken() async {
    return await _secureStorage.read(key: 'refresh_token');
  }
  
  // Check if user is authenticated
  Future<bool> isAuthenticated() async {
    final token = await getAccessToken();
    if (token == null) return false;
    
    // Check if token is expired
    try {
      final decodedToken = JwtDecoder.decode(token);
      final expirationDate = DateTime.fromMillisecondsSinceEpoch(
        decodedToken['exp'] * 1000,
      );
      return DateTime.now().isBefore(expirationDate);
    } catch (e) {
      return false;
    }
  }
  
  // Login with OAuth
  Future<bool> login() async {
    try {
      // Build OAuth request
      final authorizationTokenRequest = AuthorizationTokenRequest(
        AuthConfig.clientId,
        AuthConfig.redirectUrl,
        discoveryUrl: AuthConfig.discoveryUrl,
        scopes: ['openid', 'email', 'profile'],
        promptValues: ['login'],
      );
      
      // Initiate OAuth flow
      final AuthorizationTokenResponse? result =
          await _appAuth.authorizeAndExchangeCode(
        authorizationTokenRequest,
      );
      
      if (result == null) {
        print('[AUTH] OAuth authorization failed');
        return false;
      }
      
      // Store tokens
      await _secureStorage.write(
        key: 'access_token',
        value: result.accessToken!,
      );
      
      if (result.refreshToken != null) {
        await _secureStorage.write(
          key: 'refresh_token',
          value: result.refreshToken!,
        );
      }
      
      // Store user info from ID token
      if (result.idToken != null) {
        final idToken = result.idToken!;
        final decodedToken = JwtDecoder.decode(idToken);
        
        await _secureStorage.write(
          key: 'user_id',
          value: decodedToken['sub'],
        );
        await _secureStorage.write(
          key: 'user_email',
          value: decodedToken['email'] ?? '',
        );
        await _secureStorage.write(
          key: 'user_name',
          value: decodedToken['name'] ?? '',
        );
      }
      
      print('[AUTH] Login successful');
      print('[AUTH] User: ${await _secureStorage.read(key: 'user_email')}');
      
      return true;
    } catch (e) {
      print('[AUTH] Login error: $e');
      return false;
    }
  }
  
  // Logout
  Future<bool> logout() async {
    try {
      // Clear all stored tokens
      await _secureStorage.delete(key: 'access_token');
      await _secureStorage.delete(key: 'refresh_token');
      await _secureStorage.delete(key: 'user_id');
      await _secureStorage.delete(key: 'user_email');
      await _secureStorage.delete(key: 'user_name');
      
      print('[AUTH] Logout successful');
      return true;
    } catch (e) {
      print('[AUTH] Logout error: $e');
      return false;
    }
  }
  
  // Refresh access token
  Future<bool> refreshToken() async {
    try {
      final refreshToken = await getRefreshToken();
      if (refreshToken == null) {
        print('[AUTH] No refresh token available');
        return false;
      }
      
      // Call backend refresh endpoint
      final response = await http.post(
        Uri.parse('${AuthConfig.authUrl}/token/refresh'),
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer $refreshToken',
        },
        body: jsonEncode({
          'refreshToken': refreshToken,
        }),
      );
      
      if (response.statusCode == 200) {
        final data = jsonDecode(response.body);
        final newAccessToken = data['token'];
        
        // Store new access token
        await _secureStorage.write(
          key: 'access_token',
          value: newAccessToken,
        );
        
        print('[AUTH] Token refreshed successfully');
        return true;
      } else {
        print('[AUTH] Token refresh failed: ${response.statusCode}');
        return false;
      }
    } catch (e) {
      print('[AUTH] Token refresh error: $e');
      return false;
    }
  }
  
  // Get current user info
  Future<Map<String, dynamic>?> getCurrentUser() async {
    try {
      final userId = await _secureStorage.read(key: 'user_id');
      final email = await _secureStorage.read(key: 'user_email');
      final name = await _secureStorage.read(key: 'user_name');
      
      if (userId == null) return null;
      
      return {
        'id': userId,
        'email': email,
        'name': name,
      };
    } catch (e) {
      print('[AUTH] Get current user error: $e');
      return null;
    }
  }
  
  // Get authenticated HTTP client
  Future<http.Client> getAuthenticatedClient() async {
    final token = await getAccessToken();
    
    if (token == null) {
      throw Exception('Not authenticated');
    }
    
    // Check if token is about to expire
    try {
      final decodedToken = JwtDecoder.decode(token);
      final expirationDate = DateTime.fromMillisecondsSinceEpoch(
        decodedToken['exp'] * 1000,
      );
      final timeUntilExpiration = expirationDate.difference(DateTime.now());
      
      // Refresh if token expires in less than 5 minutes
      if (timeUntilExpiration.inSeconds < AuthConfig.jwtExpirationBuffer) {
        print('[AUTH] Token expiring soon, refreshing...');
        final refreshed = await refreshToken();
        if (!refreshed) {
          throw Exception('Failed to refresh token');
        }
      }
    } catch (e) {
      print('[AUTH] Token validation error: $e');
    }
    
    // Create HTTP client with authorization header
    return _AuthenticatedHttpClient(token);
  }
}

// Custom HTTP client with authorization header
class _AuthenticatedHttpClient extends http.BaseClient {
  final String _token;
  
  _AuthenticatedHttpClient(this._token);
  
  @override
  Future<http.Response> head(Uri url, {Map<String, String>? headers}) {
    return super.head(
      url,
      headers: _addAuthHeader(headers),
    );
  }
  
  @override
  Future<http.Response> get(Uri url, {Map<String, String>? headers}) {
    return super.get(
      url,
      headers: _addAuthHeader(headers),
    );
  }
  
  @override
  Future<http.Response> post(Uri url, {Map<String, String>? headers, Object? body, Encoding? encoding}) {
    return super.post(
      url,
      headers: _addAuthHeader(headers),
      body: body,
      encoding: encoding,
    );
  }
  
  @override
  Future<http.Response> put(Uri url, {Map<String, String>? headers, Object? body, Encoding? encoding}) {
    return super.put(
      url,
      headers: _addAuthHeader(headers),
      body: body,
      encoding: encoding,
    );
  }
  
  @override
  Future<http.Response> patch(Uri url, {Map<String, String>? headers, Object? body, Encoding? encoding}) {
    return super.patch(
      url,
      headers: _addAuthHeader(headers),
      body: body,
      encoding: encoding,
    );
  }
  
  @override
  Future<http.Response> delete(Uri url, {Map<String, String>? headers, Object? body, Encoding? encoding}) {
    return super.delete(
      url,
      headers: _addAuthHeader(headers),
      body: body,
      encoding: encoding,
    );
  }
  
  Map<String, String> _addAuthHeader(Map<String, String>? headers) {
    final finalHeaders = <String, String>{};
    if (headers != null) {
      finalHeaders.addAll(headers);
    }
    finalHeaders['Authorization'] = 'Bearer $_token';
    return finalHeaders;
  }
}
```

---

## 📱 API Authentication

### Step 3: Create API Service

**File:** `lib/services/api_service.dart`

```dart
import 'package:http/http.dart' as http;
import 'dart:convert';
import '../config/auth_config.dart';
import 'auth_service.dart';

class ApiService {
  final AuthService _authService = AuthService();
  
  // Get current user
  Future<Map<String, dynamic>?> getCurrentUser() async {
    try {
      final client = await _authService.getAuthenticatedClient();
      
      final response = await client.get(
        Uri.parse('${AuthConfig.authUrl}/me'),
      );
      
      if (response.statusCode == 200) {
        final data = jsonDecode(response.body);
        return data['user'];
      } else {
        print('[API] Get current user failed: ${response.statusCode}');
        return null;
      }
    } catch (e) {
      print('[API] Get current user error: $e');
      return null;
    }
  }
  
  // Get user profile
  Future<Map<String, dynamic>?> getUserProfile(String userId) async {
    try {
      final client = await _authService.getAuthenticatedClient();
      
      final response = await client.get(
        Uri.parse('${AuthConfig.baseUrl}/api/users/$userId'),
      );
      
      if (response.statusCode == 200) {
        return jsonDecode(response.body);
      } else {
        print('[API] Get user profile failed: ${response.statusCode}');
        return null;
      }
    } catch (e) {
      print('[API] Get user profile error: $e');
      return null;
    }
  }
  
  // Create example data
  Future<bool> createExampleData(Map<String, dynamic> data) async {
    try {
      final client = await _authService.getAuthenticatedClient();
      
      final response = await client.post(
        Uri.parse('${AuthConfig.baseUrl}/api/data'),
        headers: {
          'Content-Type': 'application/json',
        },
        body: jsonEncode(data),
      );
      
      if (response.statusCode == 201) {
        print('[API] Data created successfully');
        return true;
      } else {
        print('[API] Create data failed: ${response.statusCode}');
        return false;
      }
    } catch (e) {
      print('[API] Create data error: $e');
      return false;
    }
  }
}
```

---

## 🎨 Complete Example

### Step 4: Create Main Screen

**File:** `lib/screens/home_screen.dart`

```dart
import 'package:flutter/material.dart';
import '../services/auth_service.dart';
import '../services/api_service.dart';

class HomeScreen extends StatefulWidget {
  @override
  _HomeScreenState createState() => _HomeScreenState();
}

class _HomeScreenState extends State<HomeScreen> {
  final AuthService _authService = AuthService();
  final ApiService _apiService = ApiService();
  
  Map<String, dynamic>? _currentUser;
  bool _isLoading = false;
  
  @override
  void initState() {
    super.initState();
    _loadUserData();
  }
  
  Future<void> _loadUserData() async {
    setState(() => _isLoading = true);
    
    final isAuthenticated = await _authService.isAuthenticated();
    if (isAuthenticated) {
      final user = await _authService.getCurrentUser();
      final apiUser = await _apiService.getCurrentUser();
      
      setState(() {
        _currentUser = apiUser ?? user;
        _isLoading = false;
      });
    } else {
      setState(() => _isLoading = false);
    }
  }
  
  Future<void> _handleLogin() async {
    final success = await _authService.login();
    if (success) {
      await _loadUserData();
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('Login successful!')),
      );
    } else {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('Login failed!')),
      );
    }
  }
  
  Future<void> _handleLogout() async {
    final success = await _authService.logout();
    if (success) {
      setState(() => _currentUser = null);
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('Logout successful!')),
      );
    }
  }
  
  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Text('Better Auth + Keycloak'),
      ),
      body: _isLoading
          ? Center(child: CircularProgressIndicator())
          : Padding(
              padding: EdgeInsets.all(16),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  if (_currentUser != null) ...[
                    Text(
                      'Welcome, ${_currentUser!['name']}!',
                      style: Theme.of(context).textTheme.headlineSmall,
                    ),
                    SizedBox(height: 8),
                    Text(
                      'Email: ${_currentUser!['email']}',
                      style: Theme.of(context).textTheme.bodyMedium,
                    ),
                    SizedBox(height: 8),
                    Text(
                      'User ID: ${_currentUser!['id']}',
                      style: Theme.of(context).textTheme.bodySmall,
                    ),
                    SizedBox(height: 24),
                    ElevatedButton(
                      onPressed: _handleLogout,
                      child: Text('Logout'),
                    ),
                  ] else ...[
                    Text(
                      'Not authenticated',
                      style: Theme.of(context).textTheme.headlineSmall,
                    ),
                    SizedBox(height: 24),
                    ElevatedButton(
                      onPressed: _handleLogin,
                      child: Text('Login with Keycloak'),
                    ),
                  ],
                ],
              ),
            ),
    );
  }
}
```

---

## 📱 Platform Configuration

### iOS Configuration

**File:** `ios/Runner/Info.plist`

```xml
<key>CFBundleURLTypes</key>
<array>
  <dict>
    <key>CFBundleTypeRole</key>
    <string>Editor</string>
    <key>CFBundleURLName</key>
    <string>com.yourapp</string>
    <key>CFBundleURLSchemes</key>
    <array>
      <string>com.yourapp</string>
    </array>
  </dict>
</array>
```

---

### Android Configuration

**File:** `android/app/src/main/AndroidManifest.xml`

```xml
<activity
    android:name=".MainActivity"
    android:launchMode="singleTop"
    android:theme="@style/LaunchTheme"
    android:configChanges="orientation|keyboardHidden|keyboard|screenSize|smallestScreenSize|locale|layoutDirection|fontScale|screenLayout|density|uiMode"
    android:hardwareAccelerated="true"
    android:windowSoftInputMode="adjustResize">
    
    <!-- Deep linking -->
    <intent-filter>
        <action android:name="android.intent.action.VIEW" />
        <category android:name="android.intent.category.DEFAULT" />
        <category android:name="android.intent.category.BROWSABLE" />
        <data
            android:scheme="com.yourapp"
            android:host="oauth.callback" />
    </intent-filter>
</activity>
```

---

## 🧪 Testing

### Test 1: Login Flow

```dart
// Test login
final authService = AuthService();
final success = await authService.login();
print('Login success: $success');

// Verify token storage
final token = await authService.getAccessToken();
print('Token: $token');

// Verify user info
final user = await authService.getCurrentUser();
print('User: $user');
```

### Test 2: API Authentication

```dart
// Test API call
final apiService = ApiService();
final user = await apiService.getCurrentUser();
print('Current user: $user');
```

### Test 3: Token Refresh

```dart
// Test token refresh
final refreshed = await authService.refreshToken();
print('Token refreshed: $refreshed');
```

---

## 📚 Summary

### What We've Built

1. ✅ **OAuth Integration** - Flutter App Auth with Keycloak
2. ✅ **Token Management** - Secure JWT storage and refresh
3. ✅ **API Authentication** - Authenticated HTTP client
4. ✅ **User Management** - Get and display user info
5. ✅ **Complete Example** - Working login/logout flow

### Benefits

- ✅ **Secure** - JWT tokens with auto-refresh
- ✅ **Seamless** - OAuth flow handled automatically
- ✅ **Scalable** - Easy to add more API calls
- ✅ **Production Ready** - Error handling and token management

---

**Last Updated:** 2025-01-20
**Flutter Version:** >= 3.0
**Backend:** Hybrid Better Auth + Keycloak

🎉 **Your Flutter app is now ready to authenticate with Better Auth + Keycloak!**
