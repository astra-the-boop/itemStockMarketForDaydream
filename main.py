import csv

file = "Untitled Spreadsheet.csv"
fields = []
rows = []

with open(file, 'r') as csvfile:
    csvreader = csv.reader(csvfile)

    fields = next(csvreader)
    for row in csvreader:
        rows.append(row)

    print(f"Total number of rows: {csvreader.line_num}")


print("ROWS:")
for row in rows:
    for col in row:
        print(col, end=" ")
    print("\n")

print(fields)