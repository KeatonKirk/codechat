import React from 'react';
import {render, screen, fireEvent } from '@testing-library/react';
import TextField from '@mui/material/TextField';
import Landing from '../Components/Landing.js';

describe('Github URL input', () => {
    test('renders input field', () => {
        render(<Landing/>);
        const inputElement = screen.getByLabelText('enter a repo URL')
        expect(inputElement).toBeInTheDocument();
    })

    test('accepts user input', () => {
        render(<Landing/>)
        const inputElement = screen.getByLabelText('enter a repo URL');
        fireEvent.change(inputElement, {target: {value : 'https://github.com/user/repo' }})
        expect(inputElement.value).toBe('https://github.com/user/repo')
    })

    test('validates url', () => {
        render(<Landing />)
        const inputElement = screen.getByLabelText('enter a repo URL')
        fireEvent.change(inputElement, {target: {value: 'invalid url'}})
        const errorMessage = screen.getByText("Please enter the root URL for a public Repo.")
        expect(errorMessage).toBeInTheDocument();
    })
})