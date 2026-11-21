import { useEffect, useState } from 'react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { ThemeProvider } from './contexts/ThemeContext';
import { ErrorBoundary } from './components/ErrorBoundary';
import { TopBar, type AppRoute } from './components/TopBar';
import { useUserProgress } from './hooks/useUserProgress';
import { getProblemById, DSA_PROBLEMS } from './data/problems';
import { DashboardPage } from './pages/DashboardPage';
import { ProblemLibraryPage } from './pages/ProblemLibraryPage';
import { CategoriesPage } from './pages/CategoriesPage';
import { ProblemDetailPage } from './pages/ProblemDetailPage';
import { VisualizerLabPage } from './pages/VisualizerLabPage';
import type { DsaCategory } from './types/dsa';

function CodeRecallWorkspace() {
  const { user, profile, authError } = useAuth();
  const {
    progressMap,
    loading,
    savingProblemId,
    savePracticeState,
    isAuthenticated,
  } = useUserProgress();

  const [route, setRoute] = useState<AppRoute>('dashboard');
  const [selectedProblemId, setSelectedProblemId] = useState<string>(
    DSA_PROBLEMS[0].id,
  );
  const [libraryCategory, setLibraryCategory] = useState<DsaCategory | 'All'>(
    'All',
  );

  // Sync URL hash for clean back/forward browser navigation
  useEffect(() => {
    const syncFromHash = () => {
      const hash = window.location.hash.replace(/^#\/?/, '');
      if (hash.startsWith('problem/')) {
        const id = hash.slice('problem/'.length);
        if (getProblemById(id)) {
          setSelectedProblemId(id);
          setRoute('problem');
          return;
        }
      }
      if (hash === 'library') {
        setRoute('library');
        return;
      }
      if (hash === 'categories') {
        setRoute('categories');
        return;
      }
      if (hash === 'visualizer') {
        setRoute('visualizer');
        return;
      }
      setRoute('dashboard');
    };
    syncFromHash();
    window.addEventListener('hashchange', syncFromHash);
    return () => window.removeEventListener('hashchange', syncFromHash);
  }, []);

  const navigateTop = (next: Exclude<AppRoute, 'problem'>) => {
    if (next === 'library') setLibraryCategory('All');
    setRoute(next);
    window.location.hash = next === 'dashboard' ? '' : `#${next}`;
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const openLibraryWithCategory = (category?: DsaCategory) => {
    setLibraryCategory(category ?? 'All');
    setRoute('library');
    window.location.hash = '#library';
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const openProblem = (problemId: string) => {
    setSelectedProblemId(problemId);
    setRoute('problem');
    window.location.hash = `#problem/${problemId}`;
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const activeProblem =
    getProblemById(selectedProblemId) ?? DSA_PROBLEMS[0];

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-100">
      <TopBar currentRoute={route} onNavigate={navigateTop} />

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {authError && (
          <div
            role="alert"
            className="mb-6 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-xs text-rose-800 dark:border-rose-900/60 dark:bg-rose-950/50 dark:text-rose-200"
          >
            {authError}
          </div>
        )}

        {loading ? (
          <div className="space-y-4">
            <div className="h-36 animate-pulse rounded-2xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900" />
            <div className="grid gap-4 sm:grid-cols-4">
              {[0, 1, 2, 3].map((idx) => (
                <div
                  key={idx}
                  className="h-24 animate-pulse rounded-xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900"
                />
              ))}
            </div>
          </div>
        ) : (
          <>
            {route === 'dashboard' && (
              <DashboardPage
                progressMap={progressMap}
                streakDays={profile?.streakDays ?? 1}
                isAuthenticated={isAuthenticated}
                displayName={profile?.displayName ?? user?.displayName ?? undefined}
                onOpenProblem={openProblem}
                onOpenLibrary={openLibraryWithCategory}
              />
            )}

            {route === 'library' && (
              <ProblemLibraryPage
                key={libraryCategory}
                progressMap={progressMap}
                initialCategory={libraryCategory}
                onOpenProblem={openProblem}
              />
            )}

            {route === 'categories' && (
              <CategoriesPage
                progressMap={progressMap}
                onOpenProblem={openProblem}
                onOpenCategoryInLibrary={openLibraryWithCategory}
              />
            )}

            {route === 'visualizer' && (
              <VisualizerLabPage
                defaultLanguage={profile?.preferredLanguage ?? 'python'}
                onOpenProblem={openProblem}
              />
            )}

            {route === 'problem' && (
              <ProblemDetailPage
                problem={activeProblem}
                progress={progressMap[activeProblem.id]}
                savingProblemId={savingProblemId}
                isAuthenticated={isAuthenticated}
                defaultLanguage={profile?.preferredLanguage ?? 'python'}
                onBackToLibrary={() => navigateTop('library')}
                onSelectProblem={openProblem}
                onSavePractice={savePracticeState}
              />
            )}
          </>
        )}
      </main>

      <footer className="mt-16 border-t border-slate-200 bg-white py-6 dark:border-slate-800 dark:bg-slate-950">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4 px-4 text-xs text-slate-500 sm:px-6 lg:px-8 dark:text-slate-400">
          <span>CodeRecall — Understand the logic. Master the algorithm.</span>
          <span>30 curated DSA problems · 9 algorithmic categories</span>
        </div>
      </footer>
    </div>
  );
}

export default function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider>
        <AuthProvider>
          <CodeRecallWorkspace />
        </AuthProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}
