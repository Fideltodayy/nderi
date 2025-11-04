# CSV Import Template for Library Management System

## Required CSV Format

Your CSV file should contain the following columns in this exact order:

| Column Name | Description | Example |
|------------|-------------|---------|
| **Title** | Book title | Strange Happenings |
| **Category** | Book category | ENGLISH CLASS READERS |
| **Subject** | Subject area | English |
| **Grade** | Grade level | Grade 7 |
| **Quantity** | Total number of copies | 15 |
| **Price** | Book price (KSH) | 850 |

## Sample CSV File

```csv
Title,Category,Subject,Grade,Quantity,Price
Strange Happenings,ENGLISH CLASS READERS,English,Grade 7,15,850
The last laugh,ENGLISH CLASS READERS,English,Grade 7,15,850
The Good Earth,ENGLISH CLASS READERS,English,Grade 8,15,850
Bridges without rivers,ENGLISH CLASS READERS,English,Grade 8,15,850
The hidden package,ENGLISH CLASS READERS,English,Grade 9,15,850
Understanding oral literature by Austin Bukenya,ORAL LITERATURE,Literature,Grade 8,8,950
Oxford Head start oral literature and skills,ORAL LITERATURE,Literature,Grade 7,8,950
Master English 7,ENGLISH,English,Grade 7,8,750
Master English 8,ENGLISH,English,Grade 8,8,750
Master English 9,ENGLISH,English,Grade 9,8,750
Poetry Simplified: A guide to oral and literacy skills,POETRY,Literature,Grade 7,8,850
A poetry course for KCSE by Paul Robin,POETRY,Literature,Grade 9,8,850
Miradi na Mtihani,KISWAHILI,Kiswahili,Grade 7,8,750
Maana Mapya,KISWAHILI,Kiswahili,Grade 8,8,750
```

## Common Categories

- ENGLISH CLASS READERS
- ORAL LITERATURE
- ENGLISH
- POETRY
- KISWAHILI

## Notes

1. The system will automatically generate:
   - Unique barcodes for each book
   - Total quantity (Purchased + Donated)
   - Available quantity (initially equals total quantity)

2. Grade levels typically include:
   - Grade 7
   - Grade 8
   - Grade 9

3. Make sure your CSV file:
   - Has headers in the first row
   - Uses commas as delimiters
   - Encloses text with commas in quotes (e.g., "Understanding oral literature, by Austin Bukenya")
   - Contains no empty rows

4. The import dialog will show a preview of your data before importing
