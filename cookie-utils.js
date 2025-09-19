/**
 * Cookie utilities for NEXT_CWS_ prefixed cookies
 * Use this in your frontend to manage authentication cookies
 */

class NextCwsCookieManager {
  /**
   * Get user data from NEXT_CWS_USER cookie
   * @returns {Object|null} User object or null if not found
   */
  static getUser() {
    try {
      const userCookie = this.getCookie('NEXT_CWS_USER');
      return userCookie ? JSON.parse(decodeURIComponent(userCookie)) : null;
    } catch (error) {
      console.error('Error parsing user cookie:', error);
      return null;
    }
  }

  /**
   * Get session info from NEXT_CWS_SESSION cookie
   * @returns {Object|null} Session object or null if not found
   */
  static getSession() {
    try {
      const sessionCookie = this.getCookie('NEXT_CWS_SESSION');
      return sessionCookie ? JSON.parse(decodeURIComponent(sessionCookie)) : null;
    } catch (error) {
      console.error('Error parsing session cookie:', error);
      return null;
    }
  }

  /**
   * Check if user is authenticated
   * @returns {boolean} True if user is authenticated
   */
  static isAuthenticated() {
    const user = this.getUser();
    const session = this.getSession();
    
    if (!user || !session) return false;
    
    // Check if session is expired
    const now = new Date();
    const expiresAt = new Date(session.expiresAt);
    
    return expiresAt > now && session.isActive;
  }

  /**
   * Get user ID
   * @returns {string|null} User ID or null if not found
   */
  static getUserId() {
    const user = this.getUser();
    return user ? user.id : null;
  }

  /**
   * Get user email
   * @returns {string|null} User email or null if not found
   */
  static getUserEmail() {
    const user = this.getUser();
    return user ? user.email : null;
  }

  /**
   * Get user role
   * @returns {string|null} User role or null if not found
   */
  static getUserRole() {
    const user = this.getUser();
    return user ? user.role : null;
  }

  /**
   * Get session expiration time
   * @returns {Date|null} Expiration date or null if not found
   */
  static getSessionExpiration() {
    const session = this.getSession();
    return session ? new Date(session.expiresAt) : null;
  }

  /**
   * Check if session is expired
   * @returns {boolean} True if session is expired
   */
  static isSessionExpired() {
    const session = this.getSession();
    if (!session) return true;
    
    const now = new Date();
    const expiresAt = new Date(session.expiresAt);
    
    return expiresAt <= now;
  }

  /**
   * Get time until session expires (in milliseconds)
   * @returns {number} Milliseconds until expiration, or 0 if expired
   */
  static getTimeUntilExpiration() {
    const session = this.getSession();
    if (!session) return 0;
    
    const now = new Date();
    const expiresAt = new Date(session.expiresAt);
    
    return Math.max(0, expiresAt.getTime() - now.getTime());
  }

  /**
   * Get all NEXT_CWS cookies
   * @returns {Object} Object containing all NEXT_CWS cookies
   */
  static getAllCookies() {
    const cookies = {};
    const allCookies = document.cookie.split(';');
    
    allCookies.forEach(cookie => {
      const [name, value] = cookie.trim().split('=');
      if (name && name.startsWith('NEXT_CWS_')) {
        try {
          cookies[name] = name === 'NEXT_CWS_USER' || name === 'NEXT_CWS_SESSION' 
            ? JSON.parse(decodeURIComponent(value)) 
            : decodeURIComponent(value);
        } catch (e) {
          cookies[name] = decodeURIComponent(value);
        }
      }
    });
    
    return cookies;
  }

  /**
   * Helper method to get a specific cookie value
   * @param {string} name Cookie name
   * @returns {string|null} Cookie value or null if not found
   */
  static getCookie(name) {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) {
      return parts.pop().split(';').shift();
    }
    return null;
  }

  /**
   * Log current authentication state (for debugging)
   */
  static logAuthState() {
    console.log('🔐 Authentication State:', {
      isAuthenticated: this.isAuthenticated(),
      user: this.getUser(),
      session: this.getSession(),
      timeUntilExpiration: this.getTimeUntilExpiration(),
      isExpired: this.isSessionExpired(),
      allCookies: this.getAllCookies()
    });
  }
}

// Export for use in modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = NextCwsCookieManager;
}

// Make available globally
if (typeof window !== 'undefined') {
  window.NextCwsCookieManager = NextCwsCookieManager;
}
