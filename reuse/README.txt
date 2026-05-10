Shared navbar/footer/css workflow
=================================

This folder contains the source HTML snippets used across the site:
- navbar.html
- footer.html
- style.css

How it works
------------
1. Edit reuse/navbar.html or reuse/footer.html.
2. Run UpdateAllNavbarsAndFooters.py from the project root.
3. The script scans all root-level .html files.
4. If a page contains:
   <!-- shared:navbar:start --> ... <!-- shared:navbar:end -->
   the script replaces everything between those comments with the contents of reuse/navbar.html.
5. If a page contains:
   <!-- shared:footer:start --> ... <!-- shared:footer:end -->
   the script replaces everything between those comments with the contents of reuse/footer.html.
6. Edit reuse/style.css when you want to update the shared inline stylesheet.
7. Run UpdateAllSharedCss.py from the project root.
8. If a page contains:
   <!-- shared:css:start --> ... <!-- shared:css:end -->
   the script replaces everything between those comments with:
   <style> ... </style>
   using the contents of reuse/style.css.
9. Pages using the shared inline stylesheet should no longer include:
   <link rel="stylesheet" href="css/style.css">

Important note
--------------
The script currently updates a page only if it has both the navbar markers and the footer markers.
If either block is missing, that page is reported as failed and is left unchanged.

The CSS script updates a page only if it has the CSS markers.
If the CSS block is missing, that page is reported as failed and is left unchanged.

Typical usage
-------------
From the project root run:

py UpdateAllNavbarsAndFooters.py

or, depending on your Python setup:

python UpdateAllNavbarsAndFooters.py

For the shared CSS run:

py UpdateAllSharedCss.py

or:

python UpdateAllSharedCss.py
