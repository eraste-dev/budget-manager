import { cn } from '@/lib/utils';
import { useEffect, useRef, useState } from 'react';

/**
 * Props for the Autocomplete component.
 */
interface AutocompleteProps {
    /** Current input value */
    value: string;
    /** Callback when value changes */
    onChange: (value: string) => void;
    /** List of suggestions to display */
    suggestions: string[];
    /** Placeholder text */
    placeholder?: string;
    /** Input ID for accessibility */
    id?: string;
    /** Additional CSS classes */
    className?: string;
    /** Auto focus the input */
    autoFocus?: boolean;
}

/**
 * Autocomplete input component.
 *
 * Displays a text input with dropdown suggestions.
 * User can type freely or select from predefined options.
 */
export function Autocomplete({
    value,
    onChange,
    suggestions,
    placeholder,
    id,
    className,
    autoFocus,
}: AutocompleteProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [filteredSuggestions, setFilteredSuggestions] = useState<string[]>([]);
    const [highlightedIndex, setHighlightedIndex] = useState(-1);
    const inputRef = useRef<HTMLInputElement>(null);
    const listRef = useRef<HTMLUListElement>(null);

    /**
     * Filter suggestions based on input value.
     */
    useEffect(() => {
        if (value.trim() === '') {
            setFilteredSuggestions(suggestions);
        } else {
            const filtered = suggestions.filter((s) =>
                s.toLowerCase().includes(value.toLowerCase())
            );
            setFilteredSuggestions(filtered);
        }
        setHighlightedIndex(-1);
    }, [value, suggestions]);

    /**
     * Handle input change.
     */
    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        onChange(e.target.value);
        setIsOpen(true);
    };

    /**
     * Handle suggestion selection.
     */
    const handleSelect = (suggestion: string) => {
        onChange(suggestion);
        setIsOpen(false);
        inputRef.current?.focus();
    };

    /**
     * Handle keyboard navigation.
     */
    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (!isOpen) {
            if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
                setIsOpen(true);
                e.preventDefault();
            }
            return;
        }

        switch (e.key) {
            case 'ArrowDown':
                e.preventDefault();
                setHighlightedIndex((prev) =>
                    prev < filteredSuggestions.length - 1 ? prev + 1 : 0
                );
                break;
            case 'ArrowUp':
                e.preventDefault();
                setHighlightedIndex((prev) =>
                    prev > 0 ? prev - 1 : filteredSuggestions.length - 1
                );
                break;
            case 'Enter':
                e.preventDefault();
                if (highlightedIndex >= 0 && filteredSuggestions[highlightedIndex]) {
                    handleSelect(filteredSuggestions[highlightedIndex]);
                } else {
                    setIsOpen(false);
                }
                break;
            case 'Escape':
                setIsOpen(false);
                break;
        }
    };

    /**
     * Handle focus events.
     */
    const handleFocus = () => {
        setIsOpen(true);
    };

    /**
     * Handle blur events with delay for click handling.
     */
    const handleBlur = () => {
        setTimeout(() => setIsOpen(false), 150);
    };

    return (
        <div className="relative">
            <input
                ref={inputRef}
                id={id}
                type="text"
                value={value}
                onChange={handleInputChange}
                onKeyDown={handleKeyDown}
                onFocus={handleFocus}
                onBlur={handleBlur}
                placeholder={placeholder}
                autoFocus={autoFocus}
                autoComplete="off"
                className={cn(
                    'border-input placeholder:text-muted-foreground flex h-9 w-full rounded-md border bg-transparent px-3 py-1 text-base shadow-xs transition-[color,box-shadow] outline-none md:text-sm',
                    'focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]',
                    className
                )}
                role="combobox"
                aria-expanded={isOpen}
                aria-autocomplete="list"
                aria-controls={`${id}-listbox`}
            />

            {isOpen && filteredSuggestions.length > 0 && (
                <ul
                    ref={listRef}
                    id={`${id}-listbox`}
                    role="listbox"
                    className="bg-popover absolute z-50 mt-1 max-h-48 w-full overflow-auto rounded-md border py-1 shadow-md"
                >
                    {filteredSuggestions.map((suggestion, index) => (
                        <li
                            key={suggestion}
                            role="option"
                            aria-selected={index === highlightedIndex}
                            onClick={() => handleSelect(suggestion)}
                            className={cn(
                                'cursor-pointer px-3 py-2 text-sm',
                                index === highlightedIndex && 'bg-accent',
                                'hover:bg-accent'
                            )}
                        >
                            {suggestion}
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
}
