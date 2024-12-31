// Vercel EZ Stats Tracking Script
(function() {
  const TRACKING_URL = 'https://vercel-ez-stats.vercel.app/api/track';
  
  function track(projectId) {
    if (!projectId) {
      console.error('Vercel EZ Stats: Missing projectId');
      return;
    }

    // Send tracking data
    fetch(TRACKING_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        projectId,
        path: window.location.pathname,
        referrer: document.referrer,
        title: document.title,
        url: window.location.href,
        screen: {
          width: window.screen.width,
          height: window.screen.height
        },
        timestamp: new Date().toISOString()
      })
    }).catch(error => {
      console.error('Vercel EZ Stats tracking error:', error);
    });
  }

  // Expose tracking function
  window.vercelEzStats = { track };
})(); 