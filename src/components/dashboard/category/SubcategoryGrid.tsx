
import React from 'react';
import { CheckCircle } from 'lucide-react';

interface SubcategoryGridProps {
  selectedPrimary: string | null;
  selectedSubcategory: string | null;
  onSubcategorySelect: (subcategory: string) => void;
}

const SubcategoryGrid: React.FC<SubcategoryGridProps> = ({
  selectedPrimary,
  selectedSubcategory,
  onSubcategorySelect,
}) => {
  const subcategories = selectedPrimary === 'exam' ? 
    [
      { name: 'GRE', id: 'gre', description: 'Graduate Record Examination' },
      { name: 'IELTS', id: 'ielts', description: 'English Language Testing' },
      { name: 'TOEFL', id: 'toefl', description: 'Test of English as Foreign Language' },
      { name: 'CAT', id: 'cat', description: 'Common Admission Test' },
      { name: 'GMAT', id: 'gmat', description: 'Graduate Management Test' }
    ] : 
    [
      { name: 'Beginner', id: 'beginner', description: 'Basic everyday vocabulary' },
      { name: 'Intermediate', id: 'intermediate', description: 'Challenging vocabulary' },
      { name: 'Professional', id: 'professional', description: 'Advanced terminology' }
    ];

  if (!selectedPrimary) return null;

  return (
    <div className="animate-fade-in">
      <h3 className="text-sm font-medium mb-4 text-gray-700">
        {selectedPrimary === 'exam' ? 'Exam Type' : 'Difficulty Level'}
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {subcategories.map((subcategory) => (
          <button
            key={subcategory.id}
            onClick={() => onSubcategorySelect(subcategory.id)}
            className={`flex items-center p-4 rounded-xl transition-all duration-200 ${
              selectedSubcategory === subcategory.id 
                ? 'bg-vuilder-mint/10 ring-2 ring-vuilder-mint text-vuilder-mint shadow-sm' 
                : 'bg-gray-50 hover:bg-gray-100 text-gray-600'
            }`}
          >
            <div className="flex-1 text-left">
              <h4 className="font-medium">{subcategory.name}</h4>
              <p className="text-xs text-gray-500 mt-1">{subcategory.description}</p>
            </div>
            {selectedSubcategory === subcategory.id && (
              <CheckCircle className="h-5 w-5 ml-2 flex-shrink-0" />
            )}
          </button>
        ))}
      </div>
    </div>
  );
};

export default SubcategoryGrid;
