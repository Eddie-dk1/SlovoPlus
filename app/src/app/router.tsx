import { createBrowserRouter } from 'react-router-dom'
import { MainLayout } from '../components/layout/MainLayout'
import { AboutPage } from '../pages/AboutPage'
import { HomePage } from '../pages/HomePage'
import { LearnCategoryPage } from '../pages/LearnCategoryPage'
import { LearnPage } from '../pages/LearnPage'
import { WordPage } from '../pages/WordPage'

export const router = createBrowserRouter([
  {
    path: '/',
    element: <MainLayout />,
    children: [
      { index: true, element: <HomePage /> },
      { path: 'word/:query', element: <WordPage /> },
      { path: 'learn', element: <LearnPage /> },
      { path: 'learn/:categoryId', element: <LearnCategoryPage /> },
      { path: 'about', element: <AboutPage /> },
    ],
  },
])
