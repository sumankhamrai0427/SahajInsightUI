import { BrowserRouter } from 'react-router-dom'
import AppRoutes from './routes/AppRoutes'
import { ThemeProvider } from './theme'
import PageSEO from './components/PageSEO'
/**
 * Root App Component
 * Wraps the entire application with BrowserRouter for routing functionality
 */
function App() {
    return (
        <ThemeProvider>
            <BrowserRouter>
              <PageSEO />
                <AppRoutes />
            </BrowserRouter>
        </ThemeProvider>
    )
}

export default App
