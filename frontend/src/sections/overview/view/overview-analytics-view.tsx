import type { IOverviewResponse } from 'src/services/overview/useOverview';

import { useState, useEffect, useCallback } from 'react';

import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';

import { DashboardContent } from 'src/layouts/dashboard';
import overviewService from 'src/services/overview/useOverview';

import { AnalyticsCurrentVisits } from '../analytics-current-visits';
import { AnalyticsWebsiteVisits } from '../analytics-website-visits';
import { AnalyticsWidgetSummary } from '../analytics-widget-summary';
import { AnalyticsConversionRates } from '../analytics-conversion-rates';

// ----------------------------------------------------------------------

export function OverviewAnalyticsView() {

  const [overview, setOverview] = useState<IOverviewResponse>();



  const loadFranchises = useCallback(async () => {
    try {
      const res = await overviewService.getOverview();
      // if(typeof res === 'object') {
        setOverview(res);
      // }

    } catch (err) {
      console.error('Failed to load franchises:', err);
    }
  }, []);


  useEffect(() => {
    loadFranchises();
  }, [loadFranchises]);


  console.log('------------------------',overview);
  
  if (!overview) {
    return (
      <DashboardContent maxWidth="xl">
        <Typography variant="h6">Loading overview...</Typography>
      </DashboardContent>
    );
  }
  
  console.log('------------------------',overview);
  return (
    <DashboardContent maxWidth="xl">
      <Typography variant="h4" sx={{ mb: { xs: 3, md: 5 } }}>
        Hi, Welcome back 👋
      </Typography>

      <Grid container spacing={3}>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <AnalyticsWidgetSummary
            title="Total Requests"
            percent={overview.widgets?.totalRequests?.percent}
            total={overview.widgets?.totalRequests?.total}
            icon={<img alt="Total Requests" src="/assets/icons/glass/ic-total-req.svg" />}
            chart={{
              categories: overview?.websiteVisits?.categories,
              series: overview.widgets?.totalRequests?.series,
            }}
          />
        </Grid>

        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <AnalyticsWidgetSummary
            title="Active Locations"
            percent={overview.widgets?.activeLocations?.percent}
            total={overview.widgets?.activeLocations?.total}
            color="secondary"
            icon={<img alt="Active Locations" src="/assets/icons/glass/ic-location.svg" />}
            chart={{
              categories: overview?.websiteVisits?.categories,
              series: overview.widgets?.activeLocations?.series,
            }}
          />
        </Grid>

        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <AnalyticsWidgetSummary
            title="Pending Cases"
            percent={overview.widgets?.pendingCases?.percent}
            total={overview.widgets?.pendingCases?.total}
            color="warning"
            icon={<img alt="Pending Cases" src="/assets/icons/glass/ic-case.svg" />}
            chart={{
              categories: overview?.websiteVisits?.categories,
              series: overview.widgets?.pendingCases?.series,
            }}
          />
        </Grid>

        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <AnalyticsWidgetSummary
            title="Avg Response"
            percent={overview.widgets?.avgResponse?.percent}
            total={overview.widgets?.avgResponse?.total}
            color="error"
            icon={<img alt="Avg Response" src="/assets/icons/glass/ic-avg-res.svg" />}
            chart={{
              categories: overview?.websiteVisits?.categories,
              series: overview.widgets?.avgResponse?.series,
            }}
          />
        </Grid>

        <Grid size={{ xs: 12, md: 6, lg: 4 }}>
          <AnalyticsCurrentVisits
            title="Current visits"
            chart={{
              series: overview?.currentVisits?.series,
            }}
          />
        </Grid>

        <Grid size={{ xs: 12, md: 6, lg: 8 }}>
          <AnalyticsWebsiteVisits
            title="Website visits"
            subheader="(+43%) than last year"
            chart={{
              categories: overview?.websiteVisits?.categories,
              series: overview?.websiteVisits?.series,
            }}
          />
        </Grid>

        <Grid size={{ xs: 12, md: 6, lg: 8 }}>
          <AnalyticsConversionRates
            title="Conversion rates"
            subheader="(+43%) than last year"
            chart={{
              categories: overview?.conversionRates?.categories,
              series: overview?.conversionRates?.series,
            }}
          />
        </Grid>

      </Grid>
    </DashboardContent>
  );
}