# CSV Import Template for Library Management System

## Required CSV Format

Your CSV file should contain the following columns in this exact order:

| Column Name | Description | Example |
|------------|-------------|---------|
| **Title** | Book title | Strange Happenings |
| **Category** | Subject category | ENGLISH CLASS READERS |
| **Grade** | Grade level | Grade 7 |
| **Quantities Purchased** | Number of purchased copies | 15 |
| **Donated** | Number of donated copies | 0 |

## Sample CSV File

```csv
Title,Category,Grade,Quantities Purchased,Donated
Strange Happenings,ENGLISH CLASS READERS,Grade 7,15,0
The last laugh,ENGLISH CLASS READERS,Grade 7,15,0
The Good Earth,ENGLISH CLASS READERS,Grade 8,15,0
Bridges without rivers,ENGLISH CLASS READERS,Grade 8,15,0
The hidden package,ENGLISH CLASS READERS,Grade 9,15,0
Understanding oral literature by Austin Bukenya,ORAL LITERATURE,Grade 8,0,8
Oxford Head start oral literature and skills,ORAL LITERATURE,Grade 7,8,0
Master English 7,ENGLISH,Grade 7,8,0
Master English 8,ENGLISH,Grade 8,8,0
Master English 9,ENGLISH,Grade 9,8,0
Poetry Simplified: A guide to oral and literacy skills,POETRY,Grade 7,8,0
A poetry course for KCSE by Paul Robin,POETRY,Grade 9,8,0
Miradi na Mtihani,KISWAHILI,Grade 7,8,0
Maana Mapya,KISWAHILI,Grade 8,8,0
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
