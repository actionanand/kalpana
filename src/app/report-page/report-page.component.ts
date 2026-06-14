import { Component, computed, inject, resource } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { LoadingIndicatorComponent } from '../loading-indicator/loading-indicator.component';
import { ReportDataService } from '../services/report-data.service';

@Component({
  selector: 'app-report-page',
  imports: [LoadingIndicatorComponent, RouterLink],
  templateUrl: './report-page.component.html',
  styleUrl: './report-page.component.scss',
})
export class ReportPageComponent {
  private readonly route = inject(ActivatedRoute);
  private readonly reportDataService = inject(ReportDataService);

  protected readonly reportId = computed(() => this.route.snapshot.paramMap.get('id') ?? '');

  protected readonly reportResource = resource({
    params: () => this.reportId(),
    loader: ({ params, abortSignal }) => this.reportDataService.resolveReport(params, abortSignal),
    defaultValue: null,
  });
}
