export interface SelectListProps {
    onChange: (value: string) => void
    value?: string
    options: {
        label: string,
        id: string
    }[]
}