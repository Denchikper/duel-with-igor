#!/usr/bin/env python3
"""
Script to transform questions.json:
1. Remove all 6 questions with topic "Таблицы истинности и запросы к БД"
2. Simplify all "Системы счисления" questions
3. Add 6 new "Рекурсия" questions
4. Validate the result (50 total questions, all fields present)
"""

import json
from pathlib import Path
from typing import List, Dict, Any


def load_questions(filepath: str) -> List[Dict[str, Any]]:
    """Load questions from JSON file."""
    with open(filepath, 'r', encoding='utf-8') as f:
        return json.load(f)


def save_questions(questions: List[Dict[str, Any]], filepath: str) -> None:
    """Save questions to JSON file."""
    with open(filepath, 'w', encoding='utf-8') as f:
        json.dump(questions, f, ensure_ascii=False, indent=2)


def remove_db_queries_questions(questions: List[Dict[str, Any]]) -> tuple[List[Dict[str, Any]], int]:
    """Remove all questions with topic 'Таблицы истинности и запросы к БД'."""
    original_count = len(questions)
    filtered = [q for q in questions if q.get('topic') != 'Таблицы истинности и запросы к БД']
    removed_count = original_count - len(filtered)
    print(f"✓ Removed {removed_count} questions about 'Таблицы истинности и запросы к БД'")
    return filtered, removed_count


def simplify_number_systems_questions(questions: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
    """Simplify 'Системы счисления' questions by reducing difficulty and shortening text."""
    modified_count = 0
    
    for i, q in enumerate(questions):
        if q.get('topic') != 'Системы счисления':
            continue
        
        # Reduce difficulty levels
        current_difficulty = q.get('difficulty', 1)
        if current_difficulty >= 3:
            # Difficulty 3 → 2
            q['difficulty'] = 2
            modified_count += 1
        elif current_difficulty == 2:
            # For difficulty 2, reduce some to 1 (every other one)
            if i % 3 == 0:  # Reduce every third difficulty-2 question
                q['difficulty'] = 1
                modified_count += 1
        
        # Shorten text by removing verbose parts (e.g., remove extra explanation from question)
        text = q.get('text', '')
        # Simplify by removing unnecessary words
        if 'равно десятичному...' in text:
            text = text.replace('равно десятичному...', 'равно...')
        if 'соответствует' in text:
            text = text.replace('соответствует десятичному', 'в десятичной')
        
        q['text'] = text
    
    print(f"✓ Simplified {modified_count} 'Системы счисления' questions (reduced difficulty levels)")
    return questions


def create_recursion_questions() -> List[Dict[str, Any]]:
    """Create 6 new questions about recursion (Рекурсия) at various difficulties."""
    recursion_questions = [
        {
            "topic": "Рекурсия",
            "difficulty": 1,
            "text": "Что такое рекурсия?",
            "options": [
                "Повторение блока кода заданное число раз",
                "Функция, вызывающая саму себя",
                "Использование цикла for",
                "Создание нескольких функций"
            ],
            "correct_index": 1,
            "explanation": "Рекурсия — это когда функция вызывает саму себя до достижения условия выхода.",
            "igor_comment": "Рекурсия основана на самовызове функции с изменёнными параметрами."
        },
        {
            "topic": "Рекурсия",
            "difficulty": 1,
            "text": "Какой элемент необходим в каждой рекурсивной функции?",
            "options": [
                "Цикл while",
                "Базовый случай (условие выхода)",
                "Глобальная переменная",
                "Списковое выражение"
            ],
            "correct_index": 1,
            "explanation": "Базовый случай предотвращает бесконечную рекурсию, обеспечивая выход из функции.",
            "igor_comment": "Без базового случая функция будет вызывать саму себя бесконечно."
        },
        {
            "topic": "Рекурсия",
            "difficulty": 2,
            "text": "Чему равен результат factorial(4)?",
            "options": [
                "10",
                "16",
                "24",
                "32"
            ],
            "correct_index": 2,
            "explanation": "factorial(4) = 4 × 3 × 2 × 1 = 24",
            "igor_comment": "Факториал — классический пример рекурсии: n! = n × (n-1)!"
        },
        {
            "topic": "Рекурсия",
            "difficulty": 2,
            "text": "Какое значение вернёт fib(5) для чисел Фибоначчи?",
            "options": [
                "5",
                "8",
                "13",
                "21"
            ],
            "correct_index": 1,
            "explanation": "Последовательность: 1, 1, 2, 3, 5, 8. Пятый элемент — 8.",
            "igor_comment": "Рекурсивные числа Фибоначчи: fib(n) = fib(n-1) + fib(n-2)"
        },
        {
            "topic": "Рекурсия",
            "difficulty": 3,
            "text": "Как оптимизировать рекурсивную функцию для избежания повторных вычислений?",
            "options": [
                "Использовать больше циклов",
                "Увеличить параметры функции",
                "Применить мемоизацию или динамическое программирование",
                "Переписать функцию в процедурном стиле"
            ],
            "correct_index": 2,
            "explanation": "Мемоизация (кэширование результатов) и динамическое программирование эффективно решают проблему повторных вычислений.",
            "igor_comment": "Мемоизация — сохранение результатов вычисления для повторного использования."
        },
        {
            "topic": "Рекурсия",
            "difficulty": 3,
            "text": "Какой тип ошибки возникает при переполнении стека в рекурсии?",
            "options": [
                "IndexError",
                "ValueError",
                "RecursionError / Stack Overflow",
                "TypeError"
            ],
            "correct_index": 2,
            "explanation": "RecursionError возникает, когда глубина рекурсии превышает лимит стека вызовов.",
            "igor_comment": "В Python по умолчанию лимит около 1000 уровней рекурсии."
        }
    ]
    
    print(f"✓ Created 6 new 'Рекурсия' questions (difficulties: 1, 1, 2, 2, 3, 3)")
    return recursion_questions


def validate_questions(questions: List[Dict[str, Any]], expected_count: int = 50) -> tuple[bool, List[str]]:
    """
    Validate questions:
    - Total count matches expected
    - All required fields present
    - Options length is 4
    - correct_index is 0-3
    """
    errors = []
    
    # Check total count
    if len(questions) != expected_count:
        errors.append(f"Expected {expected_count} questions, found {len(questions)}")
    
    # Required fields
    required_fields = ['topic', 'difficulty', 'text', 'options', 'correct_index', 'explanation', 'igor_comment']
    
    for i, q in enumerate(questions):
        for field in required_fields:
            if field not in q:
                errors.append(f"Question {i+1}: missing field '{field}'")
        
        # Validate options
        options = q.get('options', [])
        if len(options) != 4:
            errors.append(f"Question {i+1}: options length is {len(options)}, expected 4")
        
        # Validate correct_index
        correct_index = q.get('correct_index')
        if not isinstance(correct_index, int) or correct_index < 0 or correct_index > 3:
            errors.append(f"Question {i+1}: correct_index {correct_index} is not in range 0-3")
        
        # Validate difficulty
        difficulty = q.get('difficulty')
        if not isinstance(difficulty, int) or difficulty < 1 or difficulty > 3:
            errors.append(f"Question {i+1}: difficulty {difficulty} is not in range 1-3")
    
    if errors:
        return False, errors
    return True, []


def print_summary(questions: List[Dict[str, Any]]) -> None:
    """Print summary of questions by topic and difficulty."""
    print("\n" + "="*60)
    print("FINAL SUMMARY")
    print("="*60)
    print(f"Total questions: {len(questions)}")
    
    # Count by topic
    topics = {}
    for q in questions:
        topic = q.get('topic')
        topics[topic] = topics.get(topic, 0) + 1
    
    print("\nQuestions by topic:")
    for topic, count in sorted(topics.items()):
        print(f"  • {topic}: {count}")
    
    # Count by difficulty and topic
    print("\nDistribution by difficulty:")
    for topic in sorted(topics.keys()):
        topic_qs = [q for q in questions if q.get('topic') == topic]
        difficulties = {}
        for q in topic_qs:
            d = q.get('difficulty', 1)
            difficulties[d] = difficulties.get(d, 0) + 1
        
        diff_str = ', '.join(f"D{d}:{c}" for d, c in sorted(difficulties.items()))
        print(f"  {topic}: {diff_str}")


def main():
    """Main execution."""
    filepath = Path('/Users/michail/hack-profimatika/content/questions.json')
    
    print("="*60)
    print("TRANSFORMING QUESTIONS.JSON")
    print("="*60)
    
    # Step 1: Load questions
    print("\n1. Loading questions...")
    questions = load_questions(str(filepath))
    print(f"   Loaded {len(questions)} questions")
    
    # Step 2: Remove "Таблицы истинности и запросы к БД" questions
    print("\n2. Removing DB queries questions...")
    questions, removed = remove_db_queries_questions(questions)
    print(f"   Remaining: {len(questions)} questions")
    
    # Step 3: Simplify "Системы счисления" questions
    print("\n3. Simplifying number systems questions...")
    questions = simplify_number_systems_questions(questions)
    
    # Step 4: Add new "Рекурсия" questions
    print("\n4. Adding recursion questions...")
    recursion_questions = create_recursion_questions()
    questions.extend(recursion_questions)
    print(f"   Total after adding: {len(questions)} questions")
    
    # Step 5: Validate
    print("\n5. Validating...")
    is_valid, errors = validate_questions(questions, expected_count=50)
    
    if is_valid:
        print("   ✓ All validations passed!")
    else:
        print("   ✗ Validation errors found:")
        for error in errors:
            print(f"     - {error}")
        return
    
    # Step 6: Save
    print("\n6. Saving to questions.json...")
    save_questions(questions, str(filepath))
    print("   ✓ Saved successfully")
    
    # Print summary
    print_summary(questions)
    
    print("\n" + "="*60)
    print("✓ TRANSFORMATION COMPLETE")
    print("="*60)


if __name__ == '__main__':
    main()
