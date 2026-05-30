"use client"

import { createContext, useState, Dispatch, SetStateAction } from 'react'

export interface PageErrorProps {
    title: string
    description?: string
    type: 'error' |'warning'
    errorKey: number
}

export const ErrorsContext = createContext<{
    errors: [PageErrorProps[], Dispatch<SetStateAction<PageErrorProps[]>>],
}>({
    errors: [[], () => { }],
})

export default function ErrorsContextProvider(props: { children: React.ReactNode }) {
    const [errors, setErrors] = useState<PageErrorProps[]>([])

    return (
        <ErrorsContext.Provider value={{ errors: [errors, setErrors] }}>
            {props.children}
        </ErrorsContext.Provider>
    )
}