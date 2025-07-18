import { Fragment } from 'react';
import { Listbox, Transition } from '@headlessui/react';
import { CheckIcon, ChevronUpDownIcon } from '@heroicons/react/24/outline';
import { SUPPORTED_LANGUAGES } from '../../data/mockData';

interface LanguageSelectProps {
  selectedLanguage: string;
  onLanguageChange: (language: string) => void;
  label?: string;
  className?: string;
  disabled?: boolean;
}

export function LanguageSelect({
  selectedLanguage,
  onLanguageChange,
  label = 'Target Language',
  className = '',
  disabled = false
}: LanguageSelectProps) {
  const selectedLang = SUPPORTED_LANGUAGES.find(lang => lang.code === selectedLanguage);
  
  return (
    <div className={className}>
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-2">
          {label}
        </label>
      )}
      
      <Listbox value={selectedLanguage} onChange={onLanguageChange} disabled={disabled}>
        <div className="relative">
          <Listbox.Button
            className={`relative w-full cursor-default rounded-md border border-gray-300 bg-white py-2 pl-3 pr-10 text-left shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 sm:text-sm ${
              disabled ? 'opacity-50 cursor-not-allowed' : ''
            }`}
          >
            <span className="flex items-center">
              {selectedLang ? (
                <>
                  <span className="text-lg mr-2">{selectedLang.flag}</span>
                  <span className="block truncate">{selectedLang.name}</span>
                  <span className="text-gray-500 ml-2">({selectedLang.nativeName})</span>
                </>
              ) : (
                <span className="text-gray-500">Select a language</span>
              )}
            </span>
            <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2">
              <ChevronUpDownIcon className="h-5 w-5 text-gray-400" aria-hidden="true" />
            </span>
          </Listbox.Button>
          
          <Transition
            as={Fragment}
            leave="transition ease-in duration-100"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <Listbox.Options className="absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-md bg-white py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm">
              {SUPPORTED_LANGUAGES.map((language) => (
                <Listbox.Option
                  key={language.code}
                  className={({ active }) =>
                    `relative cursor-default select-none py-2 pl-3 pr-9 ${
                      active ? 'bg-blue-600 text-white' : 'text-gray-900'
                    }`
                  }
                  value={language.code}
                >
                  {({ selected, active }) => (
                    <>
                      <div className="flex items-center">
                        <span className="text-lg mr-2">{language.flag}</span>
                        <span className={`block truncate ${selected ? 'font-medium' : 'font-normal'}`}>
                          {language.name}
                        </span>
                        <span className={`ml-2 ${active ? 'text-blue-200' : 'text-gray-500'}`}>
                          ({language.nativeName})
                        </span>
                      </div>
                      {selected ? (
                        <span
                          className={`absolute inset-y-0 right-0 flex items-center pr-4 ${
                            active ? 'text-white' : 'text-blue-600'
                          }`}
                        >
                          <CheckIcon className="h-5 w-5" aria-hidden="true" />
                        </span>
                      ) : null}
                    </>
                  )}
                </Listbox.Option>
              ))}
            </Listbox.Options>
          </Transition>
        </div>
      </Listbox>
    </div>
  );
}

export default LanguageSelect;
