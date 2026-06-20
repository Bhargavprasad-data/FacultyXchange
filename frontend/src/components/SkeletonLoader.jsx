import React from 'react';

const SkeletonLoader = ({ type = 'card', count = 1 }) => {
  const renderSkeleton = () => {
    // Reusable Header Skeleton
    const HeaderSkeleton = () => (
      <div className="mb-6" style={{ marginBottom: '2rem' }}>
         <div className="skeleton" style={{ height: '36px', width: '250px', marginBottom: '0.75rem' }}></div>
         <div className="skeleton" style={{ height: '20px', width: '400px', maxWidth: '80%' }}></div>
      </div>
    );

    switch (type) {
      case 'dashboard':
        return (
          <div className="skeleton-container" style={{ width: '100%', maxWidth: '1000px', margin: '0 auto', paddingTop: '1rem' }}>
            <HeaderSkeleton />
            <div style={{ display: 'grid', gap: '1.5rem', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', marginBottom: '3rem' }}>
              {[...Array(count || 3)].map((_, i) => (
                <div key={i} className="card skeleton-container" style={{ minHeight: '150px', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  <div className="skeleton" style={{ height: '24px', width: '60%' }}></div>
                  <div className="skeleton" style={{ height: '40px', width: '40%' }}></div>
                  <div className="skeleton" style={{ height: '16px', width: '80%' }}></div>
                </div>
              ))}
            </div>
            <div className="skeleton" style={{ height: '28px', width: '200px', marginBottom: '1rem' }}></div>
            <div className="skeleton" style={{ height: '300px', width: '100%', borderRadius: 'var(--radius-md)' }}></div>
          </div>
        );
      case 'admin-panel':
        return (
          <div className="skeleton-container" style={{ display: 'flex', flexDirection: 'column', gap: '2rem', width: '100%', maxWidth: '1200px', margin: '0 auto', paddingTop: '1rem' }}>
            <HeaderSkeleton />
            <div style={{ display: 'grid', gap: '1.5rem', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))' }}>
              {[...Array(3)].map((_, i) => (
                <div key={i} className="card skeleton" style={{ height: '100px', width: '100%' }}></div>
              ))}
            </div>
            <div className="skeleton" style={{ height: '45px', width: '400px', borderRadius: 'var(--radius-full)' }}></div>
            <div style={{ display: 'grid', gap: '2rem', gridTemplateColumns: '1fr 2fr' }}>
              <div className="card skeleton" style={{ height: '400px', width: '100%' }}></div>
              <div className="card skeleton" style={{ height: '400px', width: '100%' }}></div>
            </div>
          </div>
        );
      case 'table':
        return (
          <div className="skeleton-container" style={{ width: '100%', maxWidth: '1000px', margin: '0 auto', paddingTop: '1rem' }}>
            <HeaderSkeleton />
            <div className="skeleton" style={{ height: '45px', width: '300px', borderRadius: 'var(--radius-full)', marginBottom: '2rem' }}></div>
            <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <div className="skeleton skeleton-header" style={{ height: '40px', width: '100%' }}></div>
              {[...Array(5)].map((_, i) => (
                <div key={i} className="skeleton skeleton-row" style={{ height: '60px', width: '100%' }}></div>
              ))}
            </div>
          </div>
        );
      case 'timetable':
        return (
          <div className="skeleton-container" style={{ width: '100%', maxWidth: '1000px', margin: '0 auto', paddingTop: '1rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <HeaderSkeleton />
              <div className="skeleton" style={{ height: '40px', width: '120px', borderRadius: 'var(--radius-full)' }}></div>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
              {[...Array(3)].map((_, dayIndex) => (
                <div key={dayIndex} className="card" style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  <div className="skeleton" style={{ height: '24px', width: '150px', marginBottom: '1rem' }}></div>
                  <div className="skeleton" style={{ height: '40px', width: '100%' }}></div>
                  <div className="skeleton" style={{ height: '60px', width: '100%' }}></div>
                  <div className="skeleton" style={{ height: '60px', width: '100%' }}></div>
                </div>
              ))}
            </div>
          </div>
        );
      case 'form':
        return (
          <div className="skeleton-container" style={{ width: '100%', maxWidth: '900px', margin: '0 auto', paddingTop: '1rem' }}>
            <HeaderSkeleton />
            <div className="card" style={{ padding: '2rem' }}>
              <div style={{ display: 'grid', gap: '1.5rem', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', marginBottom: '2rem' }}>
                {[...Array(8)].map((_, i) => (
                  <div key={i} className="skeleton" style={{ height: '45px', width: '100%' }}></div>
                ))}
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                <div className="skeleton" style={{ height: '45px', width: '150px', borderRadius: 'var(--radius-full)' }}></div>
              </div>
            </div>
          </div>
        );
      case 'card':
      default:
        return (
          <div className="skeleton-container" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {[...Array(count)].map((_, i) => (
              <div key={i} className="card skeleton" style={{ height: '120px', width: '100%' }}></div>
            ))}
          </div>
        );
    }
  };

  return <>{renderSkeleton()}</>;
};

export default SkeletonLoader;
