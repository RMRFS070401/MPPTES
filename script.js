// Data structures
let users = [{ username: 'admin', password: 'admin123' }];
let lines = Array.from({length: 10}, (_, i) => i + 1);
let skuData = {};
let standarMPPData = {};
let kelebihanFormsCount = 0;
let kelebihanTotal = 0;
let kelebihanInput = 0;
let kelebihanForms = [];
let planningData = {};

function login() {
    let username = document.getElementById('username').value;
    let password = document.getElementById('password').value;
    let user = users.find(u => u.username === username && u.password === password);
    if (user) {
        document.getElementById('loginPage').classList.add('hidden');
        document.getElementById('dashboard').classList.remove('hidden');
    } else {
        alert('Username atau password salah');
    }
}

function showStandarMPP() {
    hideAllSections();
    document.getElementById('standarMPP').classList.remove('hidden');
    populateLineSelect('lineSelect');
}

function showAktualMPP() {
    hideAllSections();
    document.getElementById('aktualMPP').classList.remove('hidden');
    populateLineSelect('aktualLineSelect');
    document.getElementById('tanggalAktual').value = new Date().toISOString().split('T')[0]; // Set current date
    updateAktualMPPForm(); // Initialize form
}

function showPlanningPPIC() {
    hideAllSections();
    document.getElementById('planningPPIC').classList.remove('hidden');
    populateLineSelect('ppicLineSelect');
}

function showInputSKU() {
    hideAllSections();
    document.getElementById('inputSKU').classList.remove('hidden');
    populateLineSelect('skuLineSelect');
}

function hideAllSections() {
    ['dashboard', 'standarMPP', 'aktualMPP', 'planningPPIC', 'inputSKU', 'uploadForm'].forEach(id => {
        document.getElementById(id).classList.add('hidden');
    });
}

function backToLineSelection() {
    document.getElementById('skuForm').classList.add('hidden');
    document.getElementById('skuLineSelect').value = '';
    document.getElementById('skuList').innerHTML = '';
}

function backToDashboard() {
    hideAllSections();
    document.getElementById('dashboard').classList.remove('hidden');
    document.getElementById('skuForm').classList.add('hidden');
    document.getElementById('skuLineSelect').value = '';
    document.getElementById('skuList').innerHTML = '';
}

function populateLineSelect(selectId) {
    let select = document.getElementById(selectId);
    select.innerHTML = '<option value="">Pilih Line</option>';
    lines.forEach(line => {
        let option = document.createElement('option');
        option.value = line;
        option.text = `Line ${line}`;
        select.add(option);
    });
}

function updateSKUDropdowns(line) {
    // Update dropdown SKU di Standar MPP
    if (document.getElementById('lineSelect').value === line) {
        populateSKUSelect(line, document.getElementById('skuSelect'));
    }
    // Update dropdown SKU di Planning PPIC
    if (document.getElementById('ppicLineSelect').value === line) {
        populateSKUSelect(line, document.getElementById('planningSKU'));
    }
    // Tambahkan update untuk dropdown SKU lainnya jika diperlukan
}

function populateSKUSelect(line, selectElement) {
    selectElement.innerHTML = '<option value="">Pilih SKU</option>';
    let skus = skuData[line] || [];
    skus.forEach(sku => {
        let option = document.createElement('option');
        option.value = sku;
        option.textContent = sku;
        selectElement.appendChild(option);
    });
}

function updateStandarMPP(skuSelect, line) {
    let sku = skuSelect.value;
    let mppInput = skuSelect.parentNode.nextElementSibling.firstChild;
    if (standarMPPData[line] && standarMPPData[line][sku]) {
        mppInput.value = standarMPPData[line][sku];
    } else {
        mppInput.value = '';
    }
}

document.addEventListener('DOMContentLoaded', function() {

    document.getElementById('lineSelect').addEventListener('change', function() {
        let line = this.value;
        if (line) {
            document.getElementById('standarMPPForm').classList.remove('hidden');
            populateSKUSelect(line, document.getElementById('skuSelect'));
        } else {
            document.getElementById('standarMPPForm').classList.add('hidden');
        }
    });

    document.getElementById('skuLineSelect').addEventListener('change', function() {
        let line = this.value;
        let skuForm = document.getElementById('skuForm');
        if (line) {
            skuForm.classList.remove('hidden');
            displaySKUList(line);
        } else {
            skuForm.classList.add('hidden');
        }
    });

    document.getElementById('addSKUButton').addEventListener('click', addSKU);
    document.getElementById('submitSKUButton').addEventListener('click', submitSKU);
    document.getElementById('backToLineButton').addEventListener('click', backToLineSelection);
    document.getElementById('backToDashboardButton').addEventListener('click', backToDashboard);

    document.getElementById('lineSelect').addEventListener('change', function() {
        let line = this.value;
        if (line) {
            document.getElementById('standarMPPForm').classList.remove('hidden');
            populateSKUSelect(line, document.getElementById('skuSelect'));
        } else {
            document.getElementById('standarMPPForm').classList.add('hidden');
        }
    });

    document.getElementById('skuSelect').addEventListener('change', function() {
        let line = document.getElementById('lineSelect').value;
        let sku = this.value;
        let standarMPP = standarMPPData[line] ? standarMPPData[line][sku] : null;
        document.getElementById('standarMPPInput').value = standarMPP !== null ? standarMPP : '';
    });

    document.getElementById('aktualSKUSelect').addEventListener('change', function() {
        let line = document.getElementById('aktualLineSelect').value;
        let sku = this.value;
        let standarMPP = standarMPPData[line] ? standarMPPData[line][sku] : null;
        document.getElementById('standarFormasiMP').value = standarMPP !== null ? standarMPP : '';
    });

    document.getElementById('ppicLineSelect').addEventListener('change', function() {
        let line = this.value;
        if (line) {
            document.getElementById('ppicForm').classList.remove('hidden');
            document.getElementById('weekSelector').value = getCurrentWeek();
            updatePlanningTable();
        } else {
            document.getElementById('ppicForm').classList.add('hidden');
        }
    });

    document.getElementById('weekSelector').addEventListener('change', updatePlanningTable);

    document.getElementById('planningSKU').addEventListener('change', function() {
        let line = document.getElementById('ppicLineSelect').value;
        let sku = this.value;
        let standarMPP = standarMPPData[line] ? standarMPPData[line][sku] : null;
            document.getElementById('planningStandarMPP').value = standarMPP !== null ? standarMPP : '';
    });

    document.getElementById('planningEndDate').addEventListener('change', function() {
        let startDate = new Date(document.getElementById('planningStartDate').value);
        let endDate = new Date(this.value);
        if (endDate < startDate) {
            alert('Tanggal akhir tidak boleh sebelum tanggal mulai');
            this.value = '';
        }
    });

    document.getElementById('skuLineSelect').addEventListener('change', function() {
        let line = this.value;
        let skuForm = document.getElementById('skuForm');
        if (line) {
            skuForm.classList.remove('hidden');
            displaySKUList(line);
        } else {
            skuForm.classList.add('hidden');
        }
    });
});

function submitStandarMPP() {
    let line = document.getElementById('lineSelect').value;
    let sku = document.getElementById('skuSelect').value;
    let standarMPP = document.getElementById('standarMPPInput').value;
    if (line && sku && standarMPP) {
        standarMPPData[line] = standarMPPData[line] || {};
        standarMPPData[line][sku] = parseInt(standarMPP);
        alert('Standar MPP telah disimpan');
    } else {
        alert('Lengkapi semua data');
    }
}

function hitungSelisih() {
    let standarMPP = parseInt(document.getElementById('standarFormasiMP').value) || 0;
    let aktualJumlahMP = parseInt(document.getElementById('aktualJumlahMP').value) || 0;
    let selisihMP = aktualJumlahMP - standarMPP;
    document.getElementById('selisihMP').value = selisihMP;

    if (selisihMP > 0) {
    document.getElementById('keteranganJumlahMP').value = 'Kelebihan MP';
    document.getElementById('kelebihanForms').classList.remove('hidden');
    document.getElementById('uploadBeritaAcara').classList.add('hidden');
    document.getElementById('submitButton').classList.add('hidden');
    kelebihanForms = [];
    clearKelebihanForms();
    addKelebihanForm();
    } else if (selisihMP < 0) {
    document.getElementById('keteranganJumlahMP').value = 'Kekurangan MP';
    document.getElementById('kelebihanForms').classList.add('hidden');
    document.getElementById('uploadBeritaAcara').classList.remove('hidden');
    document.getElementById('submitButton').classList.remove('hidden');
    } else {
    document.getElementById('keteranganJumlahMP').value = 'Sesuai Standar';
    document.getElementById('kelebihanForms').classList.add('hidden');
    document.getElementById('uploadBeritaAcara').classList.add('hidden');
    document.getElementById('submitButton').classList.remove('hidden');
    }
}

function handleAktualMPInput(event) {
    if (event.key === 'Enter') {
        hitungSelisih();
    }
}

function addSKU() {
    let line = document.getElementById('skuLineSelect').value;
    let sku = document.getElementById('skuInput').value.trim();
    if (line && sku) {
        if (!skuData[line]) {
            skuData[line] = [];
        }
        if (!skuData[line].includes(sku)) {
            skuData[line].push(sku);
            displaySKUList(line);
            document.getElementById('skuInput').value = '';
        } else {
            alert('SKU sudah ada dalam daftar.');
        }
    } else {
        alert('Pilih line dan masukkan nama SKU');
    }
}

function displaySKUList(line) {
    let skuList = document.getElementById('skuList');
    skuList.innerHTML = '';
    let skus = skuData[line] || [];
    skus.forEach((sku, index) => {
        let li = document.createElement('li');
        li.textContent = sku;
        let deleteButton = document.createElement('button');
        deleteButton.textContent = 'Delete';
        deleteButton.onclick = () => {
            skuData[line].splice(index, 1);
            displaySKUList(line);
        };
        li.appendChild(deleteButton);
        skuList.appendChild(li);
    });
}

function addKelebihanForm() {
    let container = document.getElementById('kelebihanContainer');
    let div = document.createElement('div');

    let inputJumlah = document.createElement('input');
    inputJumlah.type = 'number';
    inputJumlah.placeholder = `Kelebihan Jumlah MP ${kelebihanForms.length + 1}`;

    let inputKeterangan = document.createElement('input');
    inputKeterangan.type = 'text';
    inputKeterangan.placeholder = 'Catatan Kelebihan MP';
    inputKeterangan.onkeypress = handleKelebihanKeteranganInput;

    div.appendChild(inputJumlah);
    div.appendChild(inputKeterangan);
    container.appendChild(div);

    inputJumlah.focus();
}

function handleKelebihanJumlahInput(event) {
    if (event.key === 'Enter') {
    let kelebihanJumlah = parseInt(this.value) || 0;
    kelebihanInput += kelebihanJumlah;
    this.nextElementSibling.focus();
    }
}

function handleKelebihanKeteranganInput(event) {
    if (event.key === 'Enter') {
    let kelebihanJumlah = parseInt(this.previousElementSibling.value) || 0;
    let keterangan = this.value;
    kelebihanForms.push({ jumlah: kelebihanJumlah, keterangan: keterangan });

    let totalKelebihan = kelebihanForms.reduce((sum, form) => sum + form.jumlah, 0);
    let aktualJumlahMP = parseInt(document.getElementById('aktualJumlahMP').value) || 0;
    let standarMPP = parseInt(document.getElementById('standarFormasiMP').value) || 0;

    if (aktualJumlahMP - totalKelebihan === standarMPP) {
    // Jika sudah sesuai, langsung tampilkan tombol submit
    document.getElementById('submitButton').classList.remove('hidden');
    document.getElementById('kelebihanForms').classList.add('hidden');
    } else if (aktualJumlahMP - totalKelebihan > standarMPP) {
    // Jika masih kelebihan, tambahkan form baru
    addKelebihanForm();
    } else {
    // Jika kekurangan, tampilkan form upload berita acara
    document.getElementById('uploadBeritaAcara').classList.remove('hidden');
    document.getElementById('submitButton').classList.remove('hidden');
    document.getElementById('kelebihanForms').classList.add('hidden');
    }

    // Reset input fields
    this.previousElementSibling.value = '';
    this.value = '';
    }
}

function clearKelebihanForms() {
    document.getElementById('kelebihanContainer').innerHTML = '';
}

function submitAktualMPP() {
    let line = document.getElementById('aktualLineSelect').value;
    let tanggal = document.getElementById('tanggalAktual').value;
    let shift = document.getElementById('shiftSelect').value;
    let sku = document.getElementById('aktualSKUSelect').value;
    let aktualJumlahMP = document.getElementById('aktualJumlahMP').value;
    let beritaAcara = document.getElementById('beritaAcaraFile').files[0];

    if (line && tanggal && shift && sku && aktualJumlahMP) {
        if (document.getElementById('uploadBeritaAcara').classList.contains('hidden') || beritaAcara) {
    if (beritaAcara && beritaAcara.type !== 'application/pdf') {
        alert('Upload file PDF yang valid untuk berita acara');
        return;
    }
        alert('Aktual MPP telah disimpan');
    // Di sini Anda bisa menambahkan kode untuk menyimpan data ke server
    } else {
        alert('Upload berita acara terlebih dahulu');
    }
        } else {
        alert('Lengkapi semua data');
        }
}

function addPlanning() {
    let line = document.getElementById('ppicLineSelect').value;
    let startDate = document.getElementById('planningStartDate').value;
    let endDate = document.getElementById('planningEndDate').value;
    let sku = document.getElementById('planningSKU').value;
    let shift = document.getElementById('planningShift').value;
    let standarMPP = document.getElementById('planningStandarMPP').value;

    if (line && startDate && endDate && sku && shift && standarMPP) {
        if (new Date(endDate) < new Date(startDate)) {
            alert('Tanggal akhir harus setelah tanggal mulai');
            return;
        }

        planningData[line] = planningData[line] || [];
        planningData[line].push({startDate, endDate, sku, shift, standarMPP});
        displayPlanningList(line);

        // Reset form
        document.getElementById('planningStartDate').value = '';
        document.getElementById('planningEndDate').value = '';
        document.getElementById('planningSKU').value = '';
        document.getElementById('planningShift').value = '1';
        document.getElementById('planningStandarMPP').value = '';
    } else {
        alert('Lengkapi semua data');
    }
}

function displayPlanningList(line) {
    let planningList = document.getElementById('planningList');
    planningList.innerHTML = '';
    planningData[line].forEach((planning, index) => {
    let li = document.createElement('li');
    li.textContent = `${planning.startDate} - ${planning.endDate}: ${planning.sku} (Shift ${planning.shift})`;
    let deleteButton = document.createElement('button');
    deleteButton.textContent = 'Delete';
    deleteButton.onclick = () => {
    planningData[line].splice(index, 1);
        displayPlanningList(line);
    };
    li.appendChild(deleteButton);
    planningList.appendChild(li);
    });
}

function getCurrentWeek() {
    let now = new Date();
    let onejan = new Date(now.getFullYear(), 0, 1);
    let weekNumber = Math.ceil((((now - onejan) / 86400000) + onejan.getDay() + 1) / 7);
    return now.getFullYear() + '-W' + (weekNumber < 10 ? '0' : '') + weekNumber;
}

function updatePlanningTable() {
    let weekInput = document.getElementById('weekSelector').value;
    let [year, week] = weekInput.split('-W');
    let firstDayOfWeek = getFirstDayOfWeek(year, week);
    let line = document.getElementById('ppicLineSelect').value;

    let tableBody = document.getElementById('planningTable').getElementsByTagName('tbody')[0];
    tableBody.innerHTML = '';

    for (let i = 0; i < 7; i++) {
        let currentDate = new Date(firstDayOfWeek);
        currentDate.setDate(firstDayOfWeek.getDate() + i);

        let row = tableBody.insertRow();
        row.insertCell(0).textContent = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'][currentDate.getDay()];
        row.insertCell(1).textContent = currentDate.toISOString().split('T')[0];

        let shiftCell = row.insertCell(2);
        let shiftSelect = document.createElement('select');
        shiftSelect.innerHTML = `
            <option value="1">Shift 1</option>
            <option value="2">Shift 2</option>
            <option value="3">Shift 3</option>
        `;
        shiftCell.appendChild(shiftSelect);

        let skuCell = row.insertCell(3);
        let skuSelect = document.createElement('select');
        populateSKUSelect(line, skuSelect);
        skuSelect.addEventListener('change', function() {
            updateStandarMPP(this, line);
        });
        skuCell.appendChild(skuSelect);

        let mppCell = row.insertCell(4);
        let mppInput = document.createElement('input');
        mppInput.type = 'number';
        mppInput.min = '0';
        mppInput.readOnly = true;
        mppCell.appendChild(mppInput);
    }
}

function getFirstDayOfWeek(year, week) {
    let date = new Date(year, 0, 1 + (week - 1) * 7);
    let day = date.getDay();
    let diff = date.getDate() - day + (day === 0 ? -6 : 1);
    return new Date(date.setDate(diff));
}

function submitPlanningPPIC() {
    let line = document.getElementById('ppicLineSelect').value;
    let weekInput = document.getElementById('weekSelector').value;
    let tableBody = document.getElementById('planningTable').getElementsByTagName('tbody')[0];
    let planningData = [];

    for (let row of tableBody.rows) {
        let date = row.cells[1].textContent;
        let shift = row.cells[2].getElementsByTagName('select')[0].value;
        let sku = row.cells[3].getElementsByTagName('select')[0].value;
        let standarMPP = row.cells[4].getElementsByTagName('input')[0].value;

        if (shift && sku && standarMPP) {
            planningData.push({
                date: date,
                line: line,
                shift: shift,
                sku: sku,
                standarMPP: standarMPP
            });
        }
    }

    if (planningData.length === 7) {
        // Here you would typically send this data to a server
        console.log(planningData);
        alert('Planning PPIC untuk satu minggu telah disimpan');
    } else {
        alert('Harap lengkapi data untuk semua hari');
    }
}

function submitSKU() {
    let line = document.getElementById('skuLineSelect').value;
    if (line && skuData[line] && skuData[line].length > 0) {
        alert('Data SKU untuk line ' + line + ' telah disimpan');
        // Update dropdown SKU di bagian lain
        updateSKUDropdowns(line);
    } else {
        alert('Tidak ada SKU yang disimpan. Harap tambahkan setidaknya satu SKU.');
    }
}

function updateAktualMPPForm() {
    let line = document.getElementById('aktualLineSelect').value;
    let tanggal = document.getElementById('tanggalAktual').value;

    if (line && tanggal) {
        let shiftSelect = document.getElementById('shiftSelect');
        let skuSelect = document.getElementById('aktualSKUSelect');

        // Clear existing options
        shiftSelect.innerHTML = '';
        skuSelect.innerHTML = '';

        let availableShifts = new Set();
        let availableSKUs = new Set();

        if (planningData[line]) {
            planningData[line].forEach(planning => {
                if (tanggal >= planning.startDate && tanggal <= planning.endDate) {
                    availableShifts.add(planning.shift);
                    availableSKUs.add(planning.sku);
                }
            });
        }

        // Populate shift dropdown
        availableShifts.forEach(shift => {
            let option = document.createElement('option');
            option.value = shift;
            option.textContent = `Shift ${shift}`;
            shiftSelect.appendChild(option);
        });

        // Populate SKU dropdown
        availableSKUs.forEach(sku => {
            let option = document.createElement('option');
            option.value = sku;
            option.textContent = sku;
            skuSelect.appendChild(option);
        });

        // If no options are available, display a message
        if (availableShifts.size === 0) {
            let option = document.createElement('option');
            option.value = "";
            option.textContent = "No shifts available";
            shiftSelect.appendChild(option);
        }
        if (availableSKUs.size === 0) {
            let option = document.createElement('option');
            option.value = "";
            option.textContent = "No SKUs available";
            skuSelect.appendChild(option);
        }
    }
}

// Add event listeners to update the form when line or date changes
document.getElementById('aktualLineSelect').addEventListener('change', updateAktualMPPForm);
document.getElementById('tanggalAktual').addEventListener('change', updateAktualMPPForm);

function submitBeritaAcara() {
    let fileInput = document.getElementById('beritaAcaraFile');
    let file = fileInput.files[0];
    if (file && file.type === 'application/pdf') {
        alert('Berita acara telah diupload');
        fileInput.value = '';
    } else {
        alert('Upload file PDF yang valid');
    }
}

function showUploadForm() {
    hideAllSections();
    document.getElementById('uploadForm').classList.remove('hidden');
}