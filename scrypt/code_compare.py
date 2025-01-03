import os
import difflib
import datetime
import webbrowser
import time

def compare_files(file1_path, file2_path):
    # Читаем файлы из текущей директории
    with open(file1_path, 'r', encoding='utf-8') as f1, \
         open(file2_path, 'r', encoding='utf-8') as f2:
        file1_lines = f1.readlines()
        file2_lines = f2.readlines()
    
    # Создаём HTML с результатами сравнения
    diff = difflib.HtmlDiff()
    html_diff = diff.make_file(
        file1_lines, 
        file2_lines,
        fromdesc=f"Оригинальный файл: {file1_path}",
        todesc=f"Новый файл: {file2_path}",
        charset='utf-8'
    )
    
    # Добавляем стили для улучшения читаемости кода
    html_diff = html_diff.replace(
        '</head>',
        '''
        <style>
            body { font-family: 'Courier New', monospace; }
            .diff_header { background-color: #f8f9fa; }
            td.diff_header { text-align: right; padding: 0 10px; }
            .diff_next { background-color: #f8f9fa; }
            .diff_add { background-color: #e6ffe6; }
            .diff_chg { background-color: #fff5b1; }
            .diff_sub { background-color: #ffe6e6; }
            td { padding: 0 10px; white-space: pre; }
        </style>
        </head>
        '''
    )
    
    # Создаём имя файла с результатами в текущей директории
    timestamp = datetime.datetime.now().strftime("%Y%m%d_%H%M%S")
    result_file = f'code_diff_{timestamp}.html'
    
    # Сохраняем результат
    with open(result_file, 'w', encoding='utf-8') as f:
        f.write(html_diff)
    
    print(f"\nРезультат сравнения сохранён в файл: {result_file}")
    print("\nЦветовые обозначения в файле:")
    print("- Зеленый фон: добавленный код")
    print("- Красный фон: удаленный код")
    print("- Желтый фон: измененный код")
    
    # Открываем результат в браузере
    webbrowser.open('file://' + os.path.abspath(result_file))
    
    return result_file

def watch_files(file1, file2):
    """Следит за изменениями в файлах и обновляет сравнение"""
    last_modified1 = os.path.getmtime(file1)
    last_modified2 = os.path.getmtime(file2)
    
    while True:
        current_modified1 = os.path.getmtime(file1)
        current_modified2 = os.path.getmtime(file2)
        
        if current_modified1 != last_modified1 or current_modified2 != last_modified2:
            print("\nОбнаружены изменения в файлах. Обновляю сравнение...")
            compare_files(file1, file2)
            last_modified1 = current_modified1
            last_modified2 = current_modified2
        
        time.sleep(1)  # Проверяем каждую секунду

if __name__ == "__main__":
    # Имена файлов в текущей директории
    file1 = "1.js"  # Оригинальный файл
    file2 = "2.js"   # Новый файл
    
    # Проверяем наличие файлов
    if not os.path.exists(file1):
        print(f"\nОшибка: Файл не найден: {file1}")
        exit(1)
    if not os.path.exists(file2):
        print(f"\nОшибка: Файл не найден: {file2}")
        exit(1)
    
    try:
        print(f"Запуск сравнения файлов в текущей директории: {os.getcwd()}")
        print("Для остановки нажмите Ctrl+C")
        
        # Создаём первое сравнение
        compare_files(file1, file2)
        
        # Запускаем отслеживание изменений
        watch_files(file1, file2)
        
    except KeyboardInterrupt:
        print("\nПрограмма остановлена")
    except Exception as e:
        print(f"\nОшибка: {str(e)}")