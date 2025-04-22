import { db } from './firebase/firebaseConfig.js';
import { collection, doc, writeBatch, serverTimestamp } from 'firebase/firestore';
import * as XLSX from 'xlsx';
import { readFile } from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

// Get the current file directory
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

async function uploadProductsToFirestore() {
    try {
        // Check for Excel file path from command line args
        const excelPath = process.argv[2];
        if (!excelPath) {
            console.error('Error: Please provide the Excel file path');
            console.error('Usage: npm run upload path/to/excel/file.xlsx');
            process.exit(1);
        }

        console.log(`Reading Excel file: ${excelPath}`);

        // Read the Excel file
        const fileBuffer = await readFile(path.resolve(__dirname, excelPath));
        const workbook = XLSX.read(fileBuffer);

        // Get the first sheet
        const worksheet = workbook.Sheets[workbook.SheetNames[0]];

        // Convert to JSON
        const products = XLSX.utils.sheet_to_json(worksheet);

        if (!products || products.length === 0) {
            console.error('No products found in Excel file');
            process.exit(1);
        }

        console.log(`Found ${products.length} products to upload`);

        // Process in batches to avoid Firestore limits
        const BATCH_SIZE = 500;
        let successCount = 0;

        for (let i = 0; i < products.length; i += BATCH_SIZE) {
            const batch = writeBatch(db);
            const currentBatch = products.slice(i, i + BATCH_SIZE);

            for (const product of currentBatch) {
                // Clean the product data
                const cleanProduct = {};

                // Convert keys to snake_case
                for (const [key, value] of Object.entries(product)) {
                    const cleanKey = key.toLowerCase().replace(/\s+/g, '_');

                    // Skip empty values
                    if (value === "" || value === null || value === undefined) {
                        continue;
                    }

                    // Convert numeric strings to numbers
                    if (typeof value === 'string' && !isNaN(value) && value.trim() !== '') {
                        cleanProduct[cleanKey] = Number(value);
                    } else {
                        cleanProduct[cleanKey] = value;
                    }
                }

                // Add metadata
                cleanProduct.created_at = serverTimestamp();
                cleanProduct.updated_at = serverTimestamp();

                // Use product_id as document ID if available, otherwise generate one
                const productId = (cleanProduct.product_id?.toString() ||
                    cleanProduct.id?.toString() ||
                    doc(collection(db, "products")).id).trim();

                const docRef = doc(db, "products", productId);
                batch.set(docRef, cleanProduct);
            }

            // Commit the batch
            await batch.commit();
            successCount += currentBatch.length;
            console.log(`Uploaded batch: ${successCount}/${products.length} products`);
        }

        console.log(`Successfully uploaded ${successCount} products to Firestore`);
        process.exit(0);

    } catch (error) {
        console.error("Error uploading products:", error);
        process.exit(1);
    }
}

// Run the script
uploadProductsToFirestore();