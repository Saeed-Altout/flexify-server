/**
 * Backend Cookie Utilities for NestJS
 * Handles cookie configuration and validation for authentication
 */

import { Response } from 'express';
import { cookieConfig, type CookieConfig } from '../config/cookie.config';

export type CookieOptions = Partial<CookieConfig>;

/**
 * Safely validate and format cookie domain
 * Prevents "option domain is invalid" errors
 */
export function validateCookieDomain(domain?: string): string | undefined {
  if (!domain) {
    return undefined;
  }

  // Basic domain format validation
  const domainRegex =
    /^[a-zA-Z0-9]([a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(\.[a-zA-Z0-9]([a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;

  if (!domainRegex.test(domain)) {
    console.warn(
      `Invalid cookie domain format: ${domain}. Domain will be omitted.`,
    );
    return undefined;
  }

  // Remove leading dot if present (some browsers don't like it)
  return domain.startsWith('.') ? domain.slice(1) : domain;
}

/**
 * Create safe cookie options optimized for global compatibility
 * Works across all browsers and environments
 */
export function createSafeCookieOptions(
  options: CookieOptions = {},
): CookieOptions {
  // Get base configuration from global cookie config
  const baseConfig = cookieConfig.getConfig();

  // Merge with provided options
  const cookieOptions: CookieOptions = {
    ...baseConfig,
    ...options,
    domain: options.domain
      ? validateCookieDomain(options.domain)
      : baseConfig.domain,
  };

  // Debug logging for cookie options
  console.log('🍪 Creating global cookie options:', {
    ...cookieOptions,
    domain: cookieOptions.domain || 'undefined (will use current domain)',
    secure: cookieOptions.secure,
    sameSite: cookieOptions.sameSite,
    httpOnly: cookieOptions.httpOnly,
    maxAge: cookieOptions.maxAge
      ? `${Math.round(cookieOptions.maxAge / (24 * 60 * 60 * 1000))} days`
      : 'undefined',
    environment: cookieConfig.getEnvironmentInfo().environment,
  });

  return cookieOptions;
}

/**
 * Set a cookie on the response with proper configuration
 */
export function setCookie(
  res: Response,
  name: string,
  value: string,
  options: CookieOptions = {},
): void {
  const cookieOptions = createSafeCookieOptions(options);

  // Set cookie using Express response
  res.cookie(name, value, cookieOptions);

  console.log(`🍪 Cookie set: ${name}`, {
    value: value.substring(0, 20) + (value.length > 20 ? '...' : ''),
    options: cookieOptions,
  });
}

/**
 * Clear a cookie by setting it to expire immediately
 */
export function clearCookie(
  res: Response,
  name: string,
  options: CookieOptions = {},
): void {
  const cookieOptions = createSafeCookieOptions({
    ...options,
    maxAge: 0, // Expire immediately
  });

  // Clear cookie using Express response
  res.clearCookie(name, cookieOptions);

  console.log(`🍪 Cookie cleared: ${name}`, { options: cookieOptions });
}

/**
 * Get cookie options for authentication cookies
 */
export function getAuthCookieOptions(): CookieOptions {
  return cookieConfig.getAuthConfig();
}

/**
 * Get cookie options for session cookies
 */
export function getSessionCookieOptions(): CookieOptions {
  return cookieConfig.getSessionConfig();
}
