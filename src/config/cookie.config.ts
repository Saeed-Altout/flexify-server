/**
 * Global Cookie Configuration
 * Handles cookie settings for all environments and ensures compatibility
 */

export interface CookieConfig {
  httpOnly: boolean;
  secure: boolean;
  sameSite: 'strict' | 'lax' | 'none';
  maxAge: number;
  path: string;
  domain?: string;
}

export class CookieConfiguration {
  private static instance: CookieConfiguration;
  private config: CookieConfig;

  private constructor() {
    this.config = this.initializeConfig();
  }

  public static getInstance(): CookieConfiguration {
    if (!CookieConfiguration.instance) {
      CookieConfiguration.instance = new CookieConfiguration();
    }
    return CookieConfiguration.instance;
  }

  private initializeConfig(): CookieConfig {
    const environment = process.env.NODE_ENV || 'development';
    const isProduction = environment === 'production';
    const isLocalhost = environment === 'development' || environment === 'test';

    // Base configuration optimized for global compatibility
    const baseConfig: CookieConfig = {
      httpOnly: false, // Allow JavaScript access for frontend
      secure: isProduction, // Only secure in production
      sameSite: 'lax', // Best cross-browser compatibility
      maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
      path: '/',
    };

    // Environment-specific overrides
    if (isLocalhost) {
      baseConfig.secure = false;
      baseConfig.sameSite = 'lax';
    }

    if (isProduction) {
      baseConfig.secure = true;
      baseConfig.sameSite = 'lax';
      
      // Add domain if specified
      if (process.env.COOKIE_DOMAIN) {
        baseConfig.domain = this.validateDomain(process.env.COOKIE_DOMAIN);
      }
    }

    console.log('🍪 Cookie configuration initialized:', {
      environment,
      config: {
        ...baseConfig,
        maxAge: `${Math.round(baseConfig.maxAge / (24 * 60 * 60 * 1000))} days`,
      },
    });

    return baseConfig;
  }

  private validateDomain(domain: string): string | undefined {
    // Basic domain format validation
    const domainRegex =
      /^[a-zA-Z0-9]([a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(\.[a-zA-Z0-9]([a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;

    if (!domainRegex.test(domain)) {
      console.warn(
        `Invalid cookie domain format: ${domain}. Domain will be omitted.`,
      );
      return undefined;
    }

    // Remove leading dot if present
    return domain.startsWith('.') ? domain.slice(1) : domain;
  }

  public getConfig(): CookieConfig {
    return { ...this.config };
  }

  public getAuthConfig(): CookieConfig {
    return {
      ...this.config,
      httpOnly: false, // Authentication cookies need JavaScript access
    };
  }

  public getSessionConfig(): CookieConfig {
    return {
      ...this.config,
      httpOnly: true, // Session cookies are more secure
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days for sessions
    };
  }

  public getClearConfig(): CookieConfig {
    return {
      ...this.config,
      maxAge: 0, // Expire immediately
    };
  }

  public updateConfig(updates: Partial<CookieConfig>): void {
    this.config = { ...this.config, ...updates };
    console.log('🍪 Cookie configuration updated:', {
      ...this.config,
      maxAge: `${Math.round(this.config.maxAge / (24 * 60 * 60 * 1000))} days`,
    });
  }

  public getEnvironmentInfo(): {
    environment: string;
    isProduction: boolean;
    isLocalhost: boolean;
    cookieDomain?: string;
  } {
    return {
      environment: process.env.NODE_ENV || 'development',
      isProduction: process.env.NODE_ENV === 'production',
      isLocalhost:
        process.env.NODE_ENV === 'development' ||
        process.env.NODE_ENV === 'test',
      cookieDomain: process.env.COOKIE_DOMAIN,
    };
  }
}

// Export singleton instance
export const cookieConfig = CookieConfiguration.getInstance();
