import { inject, Service, signal } from '@angular/core';
import { Router } from '@angular/router';
import { environment } from '../../environments/environment';

const AUTH_STORAGE_KEY = '__kp_ctx_9e4f2a7b1c03';

interface StoredAuthProof {
  readonly version: 1;
  readonly usernameSha1: string;
  readonly passwordSha1: string;
  readonly issuedAt: string;
}

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

    const usernameSha1 = await this.sha1(normalizedUsername);
    const targetUrl = this.pendingUrl();
    this.isAuthenticated.set(true);
    this.writeStoredAuthentication(usernameSha1, passwordSha1);
    this.promptOpen.set(false);
    await this.openPendingUrl(targetUrl);
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
      const storedValue = globalThis.localStorage?.getItem(AUTH_STORAGE_KEY);
      if (!storedValue) {
        return false;
      }

      const proof = JSON.parse(storedValue) as Partial<StoredAuthProof>;
      const valid =
        proof.version === 1 &&
        typeof proof.passwordSha1 === 'string' &&
        this.hashesMatch(proof.passwordSha1, environment.auth.passwordSha1);

      if (!valid) {
        globalThis.localStorage?.removeItem(AUTH_STORAGE_KEY);
      }

      return valid;
    } catch {
      this.clearStoredAuthentication();
      return false;
    }
  }

  private writeStoredAuthentication(usernameSha1: string, passwordSha1: string): void {
    try {
      const proof: StoredAuthProof = {
        version: 1,
        usernameSha1,
        passwordSha1,
        issuedAt: new Date().toISOString(),
      };
      globalThis.localStorage?.setItem(AUTH_STORAGE_KEY, JSON.stringify(proof));
    } catch {
      // Local storage can be unavailable in restricted browsing contexts.
    }
  }

  private clearStoredAuthentication(): void {
    try {
      globalThis.localStorage?.removeItem(AUTH_STORAGE_KEY);
    } catch {
      // Local storage can be unavailable in restricted browsing contexts.
    }
  }

  private async openPendingUrl(targetUrl: string): Promise<void> {
    await this.router.navigateByUrl('/404', { skipLocationChange: true });
    await this.router.navigateByUrl(targetUrl || '/');
  }
}
