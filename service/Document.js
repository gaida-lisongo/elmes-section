const ExcelJS = require('exceljs');

class Document {
    constructor(data) {
        this.data = data; // Retour de fetchGrille: { unites, students }
        this.workbook = new ExcelJS.Workbook();
        this.worksheet = null;
    }

    /**
     * Génère une grille Excel professionnelle
     * @param {Object} options - Options de génération
     * @returns {ExcelJS.Workbook} Le workbook Excel
     */
    async generateGrille(options = {}) {
        const {
            sheetName = 'Grille des Notes',
            title = 'GRILLE DES NOTES - SESSION PRINCIPALE',
            institution = 'UNIVERSITÉ',
            anneeAcademique = '2024-2025'
        } = options;

        // Créer la feuille de calcul
        this.worksheet = this.workbook.addWorksheet(sheetName);
        
        // Configuration de la page
        this.worksheet.pageSetup = {
            orientation: 'landscape',
            fitToPage: true,
            fitToWidth: 1,
            margins: { left: 0.5, right: 0.5, top: 0.75, bottom: 0.75 }
        };

        let currentRow = 1;

        // 1. En-tête principal
        currentRow = this._addHeader(currentRow, title, institution, anneeAcademique);
        
        // 2. Tableau des notes
        currentRow = this._addGradeTable(currentRow);
        
        // 3. Légende et informations
        this._addLegend(currentRow + 2);

        return this.workbook;
    }

    /**
     * Ajoute l'en-tête du document
     */
    _addHeader(startRow, title, institution, anneeAcademique) {
        const ws = this.worksheet;
        
        // Titre principal
        ws.mergeCells(`A${startRow}:Z${startRow}`);
        const titleCell = ws.getCell(`A${startRow}`);
        titleCell.value = institution;
        titleCell.font = { name: 'Arial', size: 16, bold: true };
        titleCell.alignment = { horizontal: 'center', vertical: 'middle' };
        titleCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF4472C4' } };
        titleCell.font.color = { argb: 'FFFFFFFF' };
        
        // Sous-titre
        ws.mergeCells(`A${startRow + 1}:Z${startRow + 1}`);
        const subtitleCell = ws.getCell(`A${startRow + 1}`);
        subtitleCell.value = `${title} - ${anneeAcademique}`;
        subtitleCell.font = { name: 'Arial', size: 14, bold: true };
        subtitleCell.alignment = { horizontal: 'center', vertical: 'middle' };
        subtitleCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF70AD47' } };
        subtitleCell.font.color = { argb: 'FFFFFFFF' };

        // Espacement
        ws.getRow(startRow + 2).height = 10;

        return startRow + 3;
    }

    /**
     * Ajoute le tableau principal des notes
     */
    _addGradeTable(startRow) {
        const ws = this.worksheet;
        const { unites, students } = this.data;

        let currentCol = 1;
        let headerRow1 = startRow;
        let headerRow2 = startRow + 1;
        let headerRow3 = startRow + 2;

        // Colonnes fixes: N°, Matricule, Nom
        this._addFixedColumns(headerRow1, headerRow2, headerRow3, currentCol);
        currentCol += 3;

        // Colonnes des unités d'enseignement
        unites.forEach(unite => {
            if (!unite || !unite.elements || unite.elements.length === 0) return;
            
            const elementsCount = unite.elements.length;
            const uniteStartCol = currentCol;
            
            // En-tête de l'unité (niveau 1) - fusionner sur tous les éléments + moyenne + décision
            const uniteEndCol = currentCol + elementsCount + 1; // +2 pour moyenne et décision
            
            if (uniteEndCol > uniteStartCol) {
                ws.mergeCells(headerRow1, uniteStartCol, headerRow1, uniteEndCol);
                const uniteCell = ws.getCell(headerRow1, uniteStartCol);
                uniteCell.value = `${unite.code} - ${unite.intitule}`;
                uniteCell.font = { name: 'Arial', size: 10, bold: true };
                uniteCell.alignment = { horizontal: 'center', vertical: 'middle' };
                uniteCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFD9E1F2' } };
                this._setBorder(uniteCell, 'thick');
            }

            // Sous-en-têtes des éléments (niveau 2)
            unite.elements.forEach((element) => {
                const elemCell = ws.getCell(headerRow2, currentCol);
                elemCell.value = element.designation;
                elemCell.font = { name: 'Arial', size: 9, bold: true };
                elemCell.alignment = { horizontal: 'center', vertical: 'middle', wrapText: true };
                elemCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFE2EFDA' } };
                this._setBorder(elemCell, 'thin');

                // Crédits (niveau 3)
                const creditCell = ws.getCell(headerRow3, currentCol);
                creditCell.value = `(${element.credit})`;
                creditCell.font = { name: 'Arial', size: 8, italic: true };
                creditCell.alignment = { horizontal: 'center', vertical: 'middle' };
                this._setBorder(creditCell, 'thin');

                // Définir la largeur de colonne
                ws.getColumn(currentCol).width = 15;
                currentCol++;
            });

            // Colonne moyenne UE
            const moyUeCell = ws.getCell(headerRow2, currentCol);
            moyUeCell.value = 'Moyenne';
            moyUeCell.font = { name: 'Arial', size: 9, bold: true };
            moyUeCell.alignment = { horizontal: 'center', vertical: 'middle' };
            moyUeCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFFC000' } };
            this._setBorder(moyUeCell, 'thin');

            const creditMoyCell = ws.getCell(headerRow3, currentCol);
            creditMoyCell.value = `(${unite.credits})`;
            creditMoyCell.font = { name: 'Arial', size: 8, italic: true };
            creditMoyCell.alignment = { horizontal: 'center', vertical: 'middle' };
            this._setBorder(creditMoyCell, 'thin');
            ws.getColumn(currentCol).width = 10;
            currentCol++;

            // Colonne décision UE
            const decisionUeCell = ws.getCell(headerRow2, currentCol);
            decisionUeCell.value = 'Décision';
            decisionUeCell.font = { name: 'Arial', size: 9, bold: true };
            decisionUeCell.alignment = { horizontal: 'center', vertical: 'middle' };
            decisionUeCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFF9999' } };
            this._setBorder(decisionUeCell, 'thin');

            const decisionCredit = ws.getCell(headerRow3, currentCol);
            decisionCredit.value = 'V/NV';
            decisionCredit.font = { name: 'Arial', size: 8, italic: true };
            decisionCredit.alignment = { horizontal: 'center', vertical: 'middle' };
            this._setBorder(decisionCredit, 'thin');
            ws.getColumn(currentCol).width = 8;
            currentCol++;
        });

        // Colonnes de synthèse finale
        this._addSummaryColumns(headerRow1, headerRow2, headerRow3, currentCol);

        // Ajustement des hauteurs de lignes d'en-tête
        ws.getRow(headerRow1).height = 30;
        ws.getRow(headerRow2).height = 40;
        ws.getRow(headerRow3).height = 20;

        // Données des étudiants
        let dataStartRow = startRow + 3;
        if (students && students.length > 0) {
            students.forEach((student, index) => {
                this._addStudentRow(dataStartRow + index, student, index + 1);
            });
        }

        return dataStartRow + (students ? students.length : 0);
    }

    /**
     * Ajoute les colonnes fixes (N°, Matricule, Nom)
     */
    _addFixedColumns(row1, row2, row3, startCol) {
        const ws = this.worksheet;
        
        // Numéro
        ws.mergeCells(row1, startCol, row3, startCol);
        const numCell = ws.getCell(row1, startCol);
        numCell.value = 'N°';
        numCell.font = { name: 'Arial', size: 10, bold: true };
        numCell.alignment = { horizontal: 'center', vertical: 'middle' };
        numCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF8FAADC' } };
        this._setBorder(numCell, 'thick');
        ws.getColumn(startCol).width = 5;

        // Matricule
        ws.mergeCells(row1, startCol + 1, row3, startCol + 1);
        const matCell = ws.getCell(row1, startCol + 1);
        matCell.value = 'MATRICULE';
        matCell.font = { name: 'Arial', size: 10, bold: true };
        matCell.alignment = { horizontal: 'center', vertical: 'middle' };
        matCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF8FAADC' } };
        this._setBorder(matCell, 'thick');
        ws.getColumn(startCol + 1).width = 15;

        // Nom complet
        ws.mergeCells(row1, startCol + 2, row3, startCol + 2);
        const nameCell = ws.getCell(row1, startCol + 2);
        nameCell.value = 'NOM ET PRÉNOM';
        nameCell.font = { name: 'Arial', size: 10, bold: true };
        nameCell.alignment = { horizontal: 'center', vertical: 'middle' };
        nameCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF8FAADC' } };
        this._setBorder(nameCell, 'thick');
        ws.getColumn(startCol + 2).width = 25;
    }

    /**
     * Ajoute les colonnes de synthèse
     */
    _addSummaryColumns(row1, row2, row3, startCol) {
        const ws = this.worksheet;
        const summaryColumns = [
            { header: 'TOTAL', width: 8 },
            { header: 'POURCENTAGE', width: 12 },
            { header: 'MENTION', width: 10 },
            { header: 'NCV', width: 8 },
            { header: 'NCNV', width: 8 },
            { header: 'DÉCISION', width: 12 }
        ];

        summaryColumns.forEach((col, index) => {
            ws.mergeCells(row1, startCol + index, row3, startCol + index);
            const cell = ws.getCell(row1, startCol + index);
            cell.value = col.header;
            cell.font = { name: 'Arial', size: 10, bold: true };
            cell.alignment = { horizontal: 'center', vertical: 'middle' };
            cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFF6B6B' } };
            cell.font.color = { argb: 'FFFFFFFF' };
            this._setBorder(cell, 'thick');
            ws.getColumn(startCol + index).width = col.width;
        });
    }

    /**
     * Ajoute une ligne d'étudiant
     */
    _addStudentRow(row, student, numero) {
        if (!student) return;

        const ws = this.worksheet;

        // Informations fixes
        ws.getCell(row, 1).value = numero;
        ws.getCell(row, 2).value = student.matricule || "";
        ws.getCell(row, 3).value = `${student.nom || ""} ${student.post_nom || ""} ${student.prenom || ""}`.trim();

        let currentCol = 4;
        let dataIndex = 0; // Index pour parcourir student.data

        // Parcourir les unités dans l'ordre
        if (this.data.unites) {
            this.data.unites.forEach((unite) => {
                if (!unite || !unite.elements) return;

                // Notes des éléments de cette unité
                unite.elements.forEach((element) => {
                    const note = student.data && student.data[dataIndex] !== undefined ? student.data[dataIndex] : 'X';
                    
                    const cell = ws.getCell(row, currentCol);
                    cell.value = note;
                    cell.alignment = { horizontal: "center", vertical: "middle" };

                    // Formatage conditionnel pour les notes numériques
                    if (typeof note === "number") {
                        if (note >= 16) {
                            cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FF92D050" } };
                        } else if (note >= 12) {
                            cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FFFFFF00" } };
                        } else if (note >= 10) {
                            cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FFFFC000" } };
                        } else {
                            cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FFFF6B6B" } };
                            cell.font = { color: { argb: "FFFFFFFF" } };
                        }
                    }

                    this._setBorder(cell, "thin");
                    currentCol++;
                    dataIndex++;
                });

                // Moyenne de l'unité (dans student.data après les notes des éléments)
                const moyenneUE = student.data && student.data[dataIndex] !== undefined ? student.data[dataIndex] : 0;
                const moyCell = ws.getCell(row, currentCol);
                moyCell.value = typeof moyenneUE === 'number' ? Math.round(moyenneUE * 100) / 100 : moyenneUE;
                moyCell.font = { bold: true };
                moyCell.alignment = { horizontal: "center", vertical: "middle" };
                
                // Formatage conditionnel pour la moyenne
                if (typeof moyenneUE === "number") {
                    if (moyenneUE >= 10) {
                        moyCell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FF92D050" } };
                    } else {
                        moyCell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FFFF6B6B" } };
                        moyCell.font.color = { argb: "FFFFFFFF" };
                    }
                }
                
                this._setBorder(moyCell, "thin");
                currentCol++;
                dataIndex++;

                // Décision de l'unité (V/NV)
                const decisionUE = student.data && student.data[dataIndex] !== undefined ? student.data[dataIndex] : 'NV';
                const decisionCell = ws.getCell(row, currentCol);
                decisionCell.value = decisionUE;
                decisionCell.font = { bold: true };
                decisionCell.alignment = { horizontal: "center", vertical: "middle" };
                
                // Formatage conditionnel pour la décision
                if (decisionUE === 'V') {
                    decisionCell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FF92D050" } };
                } else {
                    decisionCell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FFFF6B6B" } };
                    decisionCell.font.color = { argb: "FFFFFFFF" };
                }
                
                this._setBorder(decisionCell, "thin");
                currentCol++;
                dataIndex++;
            });
        }

        // Données de synthèse finale (les 6 dernières valeurs de student.data)
        if (student.data && student.data.length >= 6) {
            const dataLength = student.data.length;
            const synthese = [
                student.data[dataLength - 6] || 0, // total
                student.data[dataLength - 5] || 0, // pourcentage
                student.data[dataLength - 4] || "", // mention
                student.data[dataLength - 3] || 0, // ncv
                student.data[dataLength - 2] || 0, // ncnv
                student.data[dataLength - 1] || "" // décision finale
            ];

            synthese.forEach((value, index) => {
                const cell = ws.getCell(row, currentCol + index);
                cell.value = value;
                cell.font = { bold: true };
                cell.alignment = { horizontal: "center", vertical: "middle" };

                // Formatage spécial pour certaines colonnes
                if (index === 1) { // pourcentage
                    cell.value = typeof value === 'number' ? `${value.toFixed(2)}%` : value;
                } else if (index === 5) { // décision finale
                    if (value === "Passe" || value === "ADMIS") {
                        cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FF92D050" } };
                    } else {
                        cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FFFF6B6B" } };
                        cell.font.color = { argb: "FFFFFFFF" };
                    }
                }

                this._setBorder(cell, "thin");
            });
        }

        // Hauteur de ligne
        ws.getRow(row).height = 25;
    }

    /**
     * Ajoute la légende
     */
    _addLegend(startRow) {
        const ws = this.worksheet;
        
        ws.mergeCells(`A${startRow}:F${startRow}`);
        const legendCell = ws.getCell(`A${startRow}`);
        legendCell.value = 'LÉGENDE';
        legendCell.font = { name: 'Arial', size: 12, bold: true };
        legendCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFD9E1F2' } };

        const legendItems = [
            'NCV: Nombre de Crédits Validés',
            'NCNV: Nombre de Crédits Non Validés',
            'X: Note non disponible',
            'Mentions: A(90-100%), B(80-89%), C(70-79%), D(60-69%), E(50-59%), F(<50%)'
        ];

        legendItems.forEach((item, index) => {
            const cell = ws.getCell(`A${startRow + 1 + index}`);
            cell.value = `• ${item}`;
            cell.font = { name: 'Arial', size: 9 };
        });
    }

    /**
     * Trouve l'index de la note dans student.data - Version simplifiée
     * Comme les données sont mappées séquentiellement, on utilise un compteur
     */
    _findNoteIndex(student, element) {
        // Cette méthode n'est plus nécessaire car on utilise un index séquentiel
        // dans _addStudentRow
        return -1;
    }

    /**
     * Calcule la moyenne d'une unité - Version simplifiée
     * La moyenne est déjà calculée et présente dans student.data
     */
    _calculateUnitAverage(student, unite) {
        // Cette méthode n'est plus nécessaire car la moyenne est déjà
        // calculée et présente dans student.data
        return 0;
    }

    /**
     * Génère les données en tant qu'array d'objets - Version corrigée
     */
    genArray() {
        const { unites, students } = this.data;
        
        return students.map(student => {
            const row = {
                matricule: student.matricule,
                nom: `${student.nom} ${student.post_nom} ${student.prenom}`.trim(),
                email: student.e_mail
            };

            let dataIndex = 0;

            // Ajouter les données par unité selon le mapping
            unites.forEach(unite => {
                if (!unite || !unite.elements) return;
                
                // Notes des éléments
                unite.elements.forEach(element => {
                    const note = student.data && student.data[dataIndex] !== undefined ? student.data[dataIndex] : null;
                    row[`${unite.code}_${element.designation.replace(/\s+/g, '_')}`] = note;
                    dataIndex++;
                });
                
                // Moyenne de l'unité
                const moyenneUE = student.data && student.data[dataIndex] !== undefined ? student.data[dataIndex] : 0;
                row[`${unite.code}_moyenne`] = moyenneUE;
                dataIndex++;
                
                // Décision de l'unité
                const decisionUE = student.data && student.data[dataIndex] !== undefined ? student.data[dataIndex] : 'NV';
                row[`${unite.code}_decision`] = decisionUE;
                dataIndex++;
            });

            // Ajouter les données de synthèse finale
            if (student.data && student.data.length >= 6) {
                const dataLength = student.data.length;
                row.total = student.data[dataLength - 6];
                row.pourcentage = student.data[dataLength - 5];
                row.mention = student.data[dataLength - 4];
                row.ncv = student.data[dataLength - 3];
                row.ncnv = student.data[dataLength - 2];
                row.decision_finale = student.data[dataLength - 1];
            }

            return row;
        });
    }

    /**
     * Sauvegarde le fichier Excel
     * @param {string} filepath - Chemin de sauvegarde
     * @returns {Promise<void>}
     */
    async saveToFile(filepath) {
        if (!this.workbook.worksheets.length) {
            await this.generateGrille();
        }
        
        await this.workbook.xlsx.writeFile(filepath);
    }
}

module.exports = Document;