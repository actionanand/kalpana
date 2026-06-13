import { Service } from '@angular/core';
import { REPORT_CONTENT, ReportContent } from '../data/report-data';

@Service()
export class ReportDataService {
  async resolveReport(id: string, abortSignal: AbortSignal): Promise<ReportContent | null> {
    await this.simulateLookup(abortSignal);
    return REPORT_CONTENT.find((report) => report.id === id) ?? null;
  }

  private simulateLookup(abortSignal: AbortSignal): Promise<void> {
    if (abortSignal.aborted) {
      return Promise.reject(new DOMException('Request aborted', 'AbortError'));
    }

    return new Promise((resolve, reject) => {
      const timeoutId = setTimeout(resolve, 520);
      abortSignal.addEventListener(
        'abort',
        () => {
          clearTimeout(timeoutId);
          reject(new DOMException('Request aborted', 'AbortError'));
        },
        { once: true },
      );
    });
  }
}
