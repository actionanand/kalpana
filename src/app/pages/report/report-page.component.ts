import { Component, computed, inject, resource } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { ReportDataService } from '../../services/report-data.service';
import { LoadingIndicatorComponent } from '../../shared/components/loading-indicator/loading-indicator.component';

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
