export const searchFilters = [
  {
    type: 'upload_date',
    title: 'Upload date',
    values: [
      {
        name: 'all',
        description: 'All time'
      },
      {
        name: 'hour',
        description: 'Last hour'
      },
      {
        name: 'today',
        description: 'Today'
      },
      {
        name: 'week',
        description: 'This week'
      },
      {
        name: 'month',
        description: 'This month'
      },
      {
        name: 'year',
        description: 'This year'
      }
    ]
  },
  {
    type: 'type',
    title: 'Type',
    values: [
      {
        name: 'all',
        description: 'All'
      },
      {
        name: 'video',
        description: 'Video'
      },
      {
        name: 'channel',
        description: 'Channel'
      },
      {
        name: 'playlist',
        description: 'Playlist'
      },
      {
        name: 'movie',
        description: 'Movie'
      }
    ]
  },
  {
    type: 'duration',
    title: 'Duration',
    values: [
      {
        name: 'all',
        description: 'All'
      },
      {
        name: 'short',
        description: 'Short (< 4 minutes)'
      },
      {
        name: 'medium',
        description: 'Medium (4-20 minutes)'
      },
      {
        name: 'long',
        description: 'Long (> 20 minutes)'
      }
    ]
  },
  {
    type: 'sort_by',
    title: 'Sort by',
    values: [
      {
        name: 'relevance',
        description: 'Relevance'
      },
      {
        name: 'rating',
        description: 'Rating'
      },
      {
        name: 'upload_date',
        description: 'Upload date'
      },
      {
        name: 'view_count',
        description: 'View count'
      }
    ]
  },
  {
    type: 'features',
    title: 'Features',
    multiple: true,
    values: [
      {
        name: 'hd',
        description: 'HD'
      },
      {
        name: 'subtitles',
        description: 'Subtitles/CC'
      },
      {
        name: 'creative_commons',
        description: 'Creative Commons'
      },
      {
        name: '3d',
        description: '3D'
      },
      {
        name: 'live',
        description: 'Live'
      },
      {
        name: '4k',
        description: '4K'
      },
      {
        name: '360',
        description: '360°'
      },
      {
        name: 'vr180',
        description: 'VR180'
      },
      {
        name: 'hdr',
        description: 'HDR'
      }
    ]
  }
];
