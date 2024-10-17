export interface ModalContent {
    title: string,
    titleToggle?: string,
    rows: ModalRow[],
    toggle?: string,
}

export interface ModalRow {
    options: ModalOption[]
}

export interface ModalOption {
    name: string,
    value: string,
    type: String,
    hasDropdown?: boolean,
    dropdown?: ModalDropdown[],
    default?:string,
    hasToggle?: boolean,
    hideOnToggle?: boolean,
    preset?: string
}

export interface ModalDropdown {
    title: String,
    value: String,
}
