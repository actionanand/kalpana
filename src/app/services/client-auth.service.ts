import { inject, Service, signal } from '@angular/core';
import { Router } from '@angular/router';
import { environment } from '../../environments/environment';

const AUTH_STORAGE_KEY = 'kalpana.client-authenticated';

@Service()
export class ClientAuthService {
  private readonly router = inject(Router);

  readonly isAuthenticated = signal(this.readStoredAuthentication());
  readonly promptOpen = signal(false);
  readonly pendingUrl = signal('/');

  requestLogin(url: string): void {
    this.pendingUrl.set(url || '/');
    this.promptOpen.set(true);
  }

  dismissLogin(): void {
    this.promptOpen.set(false);
  }

  async login(username: string, password: string): Promise<boolean> {
    const normalizedUsername = username.trim();
    if (normalizedUsername.length === 0) {
      return false;
    }

    const passwordSha1 = await this.sha1(password);
    if (!this.hashesMatch(passwordSha1, environment.auth.passwordSha1)) {
      return false;
    }

    this.isAuthenticated.set(true);
    this.writeStoredAuthentication();
    this.promptOpen.set(false);
    await this.router.navigateByUrl(this.pendingUrl());
    return true;
  }

  private async sha1(value: string): Promise<string> {
    const encoded = new TextEncoder().encode(value);
    const digest = await globalThis.crypto.subtle.digest('SHA-1', encoded);
    return Array.from(new Uint8Array(digest))
      .map((byte) => byte.toString(16).padStart(2, '0'))
      .join('');
  }

  private hashesMatch(first: string, second: string): boolean {
    if (first.length !== second.length) {
      return false;
    }

    let difference = 0;
    for (let index = 0; index < first.length; index += 1) {
      difference |= first.charCodeAt(index) ^ second.charCodeAt(index);
    }

    return difference === 0;
  }

  private readStoredAuthentication(): boolean {
    try {
      return globalThis.sessionStorage?.getItem(AUTH_STORAGE_KEY) === 'true';
    } catch {
      return false;
    }
  }

  private writeStoredAuthentication(): void {
    try {
      globalThis.sessionStorage?.setItem(AUTH_STORAGE_KEY, 'true');
    } catch {
      // Session storage can be unavailable in restricted browsing contexts.
    }
  }
}
