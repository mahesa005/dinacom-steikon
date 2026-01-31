interface FormSection {
  id: string;
  title: string;
}

interface FormNavigationProps {
  sections: FormSection[];
  currentSection: string;
  completedSections: string[];
  onSectionChange: (sectionId: string) => void;
}

export function FormNavigation({
  sections,
  currentSection,
  completedSections,
  onSectionChange,
}: FormNavigationProps) {
  return (
    <div className="space-y-2">
      {sections.map((section, index) => {
        const isActive = currentSection === section.id;
        const isCompleted = completedSections.includes(section.id);
        const isAccessible = index === 0 || completedSections.includes(sections[index - 1].id);

        return (
          <button
            key={section.id}
            onClick={() => isAccessible && onSectionChange(section.id)}
            disabled={!isAccessible}
            className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-all ${
              isActive
                ? 'bg-teal-50 text-teal-700 border-2 border-teal-200'
                : isCompleted
                ? 'bg-green-50 text-green-700 hover:bg-green-100'
                : isAccessible
                ? 'bg-white text-gray-600 hover:bg-gray-50 border border-gray-200'
                : 'bg-gray-50 text-gray-400 cursor-not-allowed border border-gray-100'
            }`}
          >
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold ${
                isActive
                  ? 'bg-teal-600 text-white'
                  : isCompleted
                  ? 'bg-green-600 text-white'
                  : isAccessible
                  ? 'bg-gray-200 text-gray-600'
                  : 'bg-gray-100 text-gray-400'
              }`}
            >
              {isCompleted ? '✓' : index + 1}
            </div>
            <div className="flex-1 text-left">
              <p className="font-medium">{section.title}</p>
            </div>
          </button>
        );
      })}
    </div>
  );
}
