import { BrowseColumn, BrowseFilter } from './browse.models';

export const BROWSE_COLUMNS: readonly BrowseColumn[] = [
  {
    id: 'urban-systems',
    title: 'Urban Systems',
    sections: [
      {
        id: 'transit-pattern-atlas',
        title: 'Transit Pattern Atlas',
        expanded: true,
        areaIds: ['mobility'],
        links: [
          { label: 'India', href: '#', territoryId: 'india' },
          { label: 'Singapore', href: '#', territoryId: 'singapore' },
          { label: 'Netherlands', href: '#', territoryId: 'netherlands' },
        ],
      },
      {
        id: 'public-space-observatory',
        title: 'Public Space Observatory',
        expanded: true,
        areaIds: ['public-realm'],
        links: [
          { label: 'Brazil', href: '#', territoryId: 'brazil' },
          { label: 'Canada', href: '#', territoryId: 'canada' },
        ],
      },
      {
        id: 'housing-affordability-monitor',
        title: 'Housing Affordability Monitor',
        expanded: false,
        areaIds: ['housing'],
        children: [
          {
            id: 'rental-supply-dashboard',
            title: 'Rental supply dashboard',
            territoryIds: ['canada', 'netherlands', 'singapore'],
          },
          {
            id: 'adaptive-reuse-library',
            title: 'Adaptive reuse library',
            territoryIds: ['india', 'brazil'],
          },
        ],
      },
      {
        id: 'digital-civic-services',
        title: 'Digital Civic Services Index',
        expanded: true,
        areaIds: ['digital-services'],
        children: [
          {
            id: 'permit-journey-benchmarks',
            title: 'Permit journey benchmarks',
            territoryIds: ['estonia', 'singapore', 'canada'],
          },
          {
            id: 'resident-access-playbook',
            title: 'Resident access playbook',
            territoryIds: ['india', 'kenya'],
          },
        ],
      },
    ],
  },
  {
    id: 'climate-resilience',
    title: 'Climate Resilience',
    sections: [
      {
        id: 'watershed-readiness',
        title: 'Watershed Readiness Tracker',
        expanded: true,
        areaIds: ['water'],
        children: [
          {
            id: 'stormwater-investment-map',
            title: 'Stormwater investment map',
            territoryIds: ['netherlands', 'canada'],
          },
          {
            id: 'catchment-risk-briefs',
            title: 'Catchment risk briefs',
            territoryIds: ['kenya', 'brazil', 'india'],
          },
        ],
      },
      {
        id: 'heat-risk-playbook',
        title: 'Heat Risk Playbook',
        expanded: true,
        areaIds: ['heat'],
        children: [
          {
            id: 'cool-corridor-examples',
            title: 'Cool corridor examples',
            territoryIds: ['india', 'singapore', 'brazil'],
          },
          {
            id: 'shade-equity-scorecard',
            title: 'Shade equity scorecard',
            territoryIds: ['kenya', 'canada'],
          },
        ],
      },
      {
        id: 'coastal-adaptation-directory',
        title: 'Coastal Adaptation Directory',
        expanded: true,
        areaIds: ['coastal'],
        links: [
          { label: 'International', href: '#', territoryId: 'international' },
          { label: 'Netherlands', href: '#', territoryId: 'netherlands' },
          { label: 'Singapore', href: '#', territoryId: 'singapore' },
        ],
      },
    ],
  },
];

export const BROWSE_FILTERS: readonly BrowseFilter[] = [
  {
    key: 'territory',
    label: 'Country / territory',
    searchable: true,
    grouped: true,
    options: [
      { id: 'canada', label: 'Canada', count: 18, region: 'North America' },
      { id: 'brazil', label: 'Brazil', count: 12, region: 'Latin America' },
      { id: 'estonia', label: 'Estonia', count: 9, region: 'Europe' },
      { id: 'netherlands', label: 'Netherlands', count: 16, region: 'Europe' },
      { id: 'india', label: 'India', count: 21, region: 'Asia Pacific' },
      { id: 'singapore', label: 'Singapore', count: 17, region: 'Asia Pacific' },
      { id: 'kenya', label: 'Kenya', count: 11, region: 'Middle East, Africa' },
      { id: 'international', label: 'International', count: 14, region: 'International' },
    ],
  },
  {
    key: 'knowledgeArea',
    label: 'Knowledge area',
    searchable: true,
    grouped: false,
    options: [
      { id: 'mobility', label: 'Mobility', count: 24 },
      { id: 'public-realm', label: 'Public realm', count: 15 },
      { id: 'housing', label: 'Housing', count: 19 },
      { id: 'digital-services', label: 'Digital services', count: 13 },
      { id: 'water', label: 'Water systems', count: 18 },
      { id: 'heat', label: 'Heat adaptation', count: 16 },
      { id: 'coastal', label: 'Coastal planning', count: 10 },
    ],
  },
];

export const EMPTY_BROWSE_RESPONSE = {
  title: 'Civic knowledge browse',
  columns: [],
} as const;
