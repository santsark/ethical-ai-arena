import { render, screen, fireEvent } from '@testing-library/react'
import { Login } from '../components/Login'

describe('Login Component', () => {
    it('renders login form correctly', () => {
        render(<Login onLogin={() => { }} />)

        // Check for main title
        expect(screen.getByText('Ethical AI Arena')).toBeInTheDocument()

        // Check for input field
        const input = screen.getByPlaceholderText('••••••••')
        expect(input).toBeInTheDocument()

        // Check for submission button
        expect(screen.getByRole('button', { name: /authenticate/i })).toBeInTheDocument()
    })

    it('toggles to admin mode', () => {
        render(<Login onLogin={() => { }} />)

        // Click toggle button
        const toggleBtn = screen.getByText('Admin Access')
        fireEvent.click(toggleBtn)

        // Check for admin title
        expect(screen.getByText('Admin Console')).toBeInTheDocument()
    })
})
