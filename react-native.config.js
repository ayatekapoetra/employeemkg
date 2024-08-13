module.exports = {
    // project: {
    //     ios: {
    //         // unstable_reactLegacyComponentNames: ['AIRMap'],
    //     },
    //     android: {
    //         unstable_reactLegacyComponentNames: ['AIRMap'],
    //     },
    // },
    project: {
        android: {
          unstable_reactLegacyComponentNames: [
            'AIRMap',
            'AIRMapCallout',
            'AIRMapCalloutSubview',
            'AIRMapCircle',
            'AIRMapHeatmap',
            'AIRMapLocalTile',
            'AIRMapMarker',
            'AIRMapOverlay',
            'AIRMapPolygon',
            'AIRMapPolyline',
            'AIRMapUrlTile',
            'AIRMapWMSTile',
          ],
        },
        ios: {
          unstable_reactLegacyComponentNames: [
            'AIRMap',
            'AIRMapCallout',
            'AIRMapCalloutSubview',
            'AIRMapCircle',
            'AIRMapHeatmap',
            'AIRMapLocalTile',
            'AIRMapMarker',
            'AIRMapOverlay',
            'AIRMapPolygon',
            'AIRMapPolyline',
            'AIRMapUrlTile',
            'AIRMapWMSTile',
          ],
        },
    },
    assets: ['./assets/fonts/'],
};