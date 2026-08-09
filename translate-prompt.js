import fs from 'fs';

let server = fs.readFileSync('server.ts', 'utf8');

// Find the start of the sizeProperties definition
const startIdx = server.indexOf('let sizeProperties = "";');

// Find the end of the API route catch block
const endIdx = server.indexOf('console.error("Error generating amplop prompt:", error);');

if (startIdx !== -1 && endIdx !== -1) {
    const codeBefore = server.substring(0, startIdx);
    const codeAfter = server.substring(endIdx - 14);

    const newCode = `let sizeProperties = "";
      if (finalUkuranAmplop.includes("7 × 9") || finalUkuranAmplop === "7 × 9 cm") {
        sizeProperties = \`Properti:

Lebar Panel Depan:
7 cm

Tinggi Panel Depan:
9 cm

Lebar Area Lem (Glue Area):
0.8 cm

Tinggi Flap Penutup Atas:
2 cm

Tinggi Flap Penutup Bawah:
1 cm

Total Ukuran Terbuka:
10.6 × 12 cm

Profil Bentuk:
Persegi Panjang Ringkas

Sudut Pandang:
Pandangan ortografis dari atas ke bawah (90 derajat)

Skala:
Proporsi dunia nyata 1:1 yang sebenarnya\`;
      } else if (finalUkuranAmplop.includes("8 × 12") || finalUkuranAmplop === "8 × 12 cm") {
        sizeProperties = \`Properti:

Lebar Panel Depan:
8 cm

Tinggi Panel Depan:
12 cm

Lebar Area Lem (Glue Area):
1 cm

Tinggi Flap Penutup Atas:
2.5 cm

Tinggi Flap Penutup Bawah:
1 cm

Total Ukuran Terbuka:
11 × 15.5 cm

Profil Bentuk:
Persegi Panjang Ramping

Sudut Pandang:
Pandangan ortografis dari atas ke bawah (90 derajat)

Skala:
Proporsi dunia nyata 1:1 yang sebenarnya\`;
      } else if (finalUkuranAmplop.includes("8 × 16") || finalUkuranAmplop === "8 × 16 cm") {
        sizeProperties = \`Properti:

Lebar Panel Depan:
8 cm

Tinggi Panel Depan:
16 cm

Lebar Area Lem (Glue Area):
1 cm

Tinggi Flap Penutup Atas:
3 cm

Tinggi Flap Penutup Bawah:
1 cm

Total Ukuran Terbuka:
11 × 20 cm

Profil Bentuk:
Persegi Panjang Panjang

Sudut Pandang:
Pandangan ortografis dari atas ke bawah (90 derajat)

Skala:
Proporsi dunia nyata 1:1 yang sebenarnya\`;
      } else if (finalUkuranAmplop.includes("110 × 220") || finalUkuranAmplop === "11 × 22 cm" || finalUkuranAmplop.includes("11 x 22") || finalUkuranAmplop.includes("110 x 220")) {
        sizeProperties = \`Properti:

Lebar Panel Depan:
11 cm

Tinggi Panel Depan:
22 cm

Lebar Area Lem (Glue Area):
1.5 cm

Tinggi Flap Penutup Atas:
4 cm

Tinggi Flap Penutup Bawah:
2 cm

Total Ukuran Terbuka:
16 × 28 cm

Profil Bentuk:
Amplop Bisnis

Sudut Pandang:
Pandangan ortografis dari atas ke bawah (90 derajat)

Skala:
Proporsi dunia nyata 1:1 yang sebenarnya\`;
      } else if (finalUkuranAmplop.includes("130 × 230") || finalUkuranAmplop === "13 × 23 cm" || finalUkuranAmplop.includes("13 x 23") || finalUkuranAmplop.includes("130 x 230")) {
        sizeProperties = \`Properti:

Lebar Panel Depan:
13 cm

Tinggi Panel Depan:
23 cm

Lebar Area Lem (Glue Area):
1.5 cm

Tinggi Flap Penutup Atas:
4 cm

Tinggi Flap Penutup Bawah:
2 cm

Total Ukuran Terbuka:
18 × 29 cm

Profil Bentuk:
Amplop Undangan

Sudut Pandang:
Pandangan ortografis dari atas ke bawah (90 derajat)

Skala:
Proporsi dunia nyata 1:1 yang sebenarnya\`;
      } else if (finalUkuranAmplop.includes("150 × 250") || finalUkuranAmplop === "15 × 25 cm" || finalUkuranAmplop.includes("15 x 25") || finalUkuranAmplop.includes("150 x 250")) {
        sizeProperties = \`Properti:

Lebar Panel Depan:
15 cm

Tinggi Panel Depan:
25 cm

Lebar Area Lem (Glue Area):
1.5 cm

Tinggi Flap Penutup Atas:
4.5 cm

Tinggi Flap Penutup Bawah:
2 cm

Total Ukuran Terbuka:
20 × 31.5 cm

Profil Bentuk:
Amplop Undangan Premium

Sudut Pandang:
Pandangan ortografis dari atas ke bawah (90 derajat)

Skala:
Proporsi dunia nyata 1:1 yang sebenarnya\`;
      } else if (finalUkuranAmplop.includes("170 × 260") || finalUkuranAmplop === "17 × 26 cm" || finalUkuranAmplop.includes("17 x 26") || finalUkuranAmplop.includes("170 x 260")) {
        sizeProperties = \`Properti:

Lebar Panel Depan:
17 cm

Tinggi Panel Depan:
26 cm

Lebar Area Lem (Glue Area):
2 cm

Tinggi Flap Penutup Atas:
5 cm

Tinggi Flap Penutup Bawah:
2 cm

Total Ukuran Terbuka:
23 × 33 cm

Profil Bentuk:
Amplop Undangan Besar

Sudut Pandang:
Pandangan ortografis dari atas ke bawah (90 derajat)

Skala:
Proporsi dunia nyata 1:1 yang sebenarnya\`;
      } else {
        let w = customLebar || "{{Width}}";
        let h = customTinggi || "{{Height}}";
        let unit = customSatuan || "cm";
        if(unit === "mm" && w !== "{{Width}}") {
          w = (parseFloat(w) / 10).toString();
        }
        if(unit === "mm" && h !== "{{Height}}") {
          h = (parseFloat(h) / 10).toString();
        }
        sizeProperties = \`Properti:

Lebar Panel Depan:
\${w} cm

Tinggi Panel Depan:
\${h} cm

Lebar Area Lem (Glue Area):
≈ 10–12% × Lebar

Tinggi Flap Penutup Atas:
≈ 18–22% × Tinggi

Tinggi Flap Penutup Bawah:
≈ 8–10% × Tinggi

Total Ukuran Terbuka:
Lebar Depan + Area Lem + (Toleransi) kali Tinggi + Flap Atas + Flap Bawah

Profil Bentuk:
Ditentukan secara otomatis

Sudut Pandang:
Pandangan ortografis dari atas ke bawah (90 derajat)

Skala:
Proporsi dunia nyata 1:1 yang sebenarnya\`;
      }

      const outputPrompt = \`Buat cetak biru teknis berkualitas tinggi dari TEMPLATE PISAU POND (DIE-CUT) AMPLOP 2D DATAR YANG BELUM DILIPAT (UNFOLDED) DAN SIAP CETAK.

Ini BUKAN mockup.
Ini BUKAN amplop yang sudah dilipat.
Ini BUKAN amplop yang sudah jadi.

Outputnya harus berupa template amplop siap cetak profesional yang siap untuk dicetak, dipotong, dilipat, dan dirakit secara manual.

Kertas Cetak:
\${paperSize}

Orientasi:
Potret

Ukuran Kanvas:
Gunakan ukuran kertas yang dipilih HANYA sebagai kanvas pencetakan.

══════════════════════════════════════
1. PARAMETER UKURAN & STRUKTUR (DIKUNCI)
══════════════════════════════════════

Jenis Amplop:
\${finalJenisAmplop}

Gaya Amplop:
\${gayaDesain}

Ukuran Amplop Jadi:
\${finalUkuranAmplop}

\${sizeProperties}

══════════════════════════════════════
2. KONSTRUKSI AMPLOP (WAJIB)
══════════════════════════════════════

Hasilkan TEMPLATE AMPLOP TERBUKA (UNFOLDED) YANG LENGKAP.

Seluruh bagian amplop HARUS tetap TERBUKA.

Template HARUS ditampilkan sebelum dilipat.

Semua bagian HARUS tetap terhubung sebagai satu kesatuan garis potong (dieline) yang utuh.

Template yang dihasilkan HARUS menyertakan:

• Panel Depan
• Panel Belakang
• Flap Penutup Atas
• Flap Penutup Bawah
• Area Lem

Seluruh struktur amplop yang terbuka HARUS terlihat sepenuhnya.

JANGAN memotong bagian mana pun.

JANGAN menyederhanakan template.

JANGAN hanya menghasilkan panel depan.

JANGAN hanya menghasilkan panel belakang.

JANGAN menghasilkan amplop yang sudah dilipat.

JANGAN memisahkan bagian-bagian amplop.

Hasil akhirnya harus menyerupai template pemotongan amplop siap cetak profesional yang digunakan oleh perusahaan percetakan komersial.

══════════════════════════════════════
3. PANEL DESAIN
══════════════════════════════════════

Panel Depan

Latar Belakang:
\${finalWarnaDominan}

Judul (Headline):
\${headline || 'None'}
\${!headline ? '\\nJika judul kosong, jangan hasilkan judul.' : ''}

Gaya Ilustrasi:
\${gayaDesain}

Tema:
\${finalElemenDekorasi}

Buat karya seni premium berdasarkan:

• Jenis Amplop
• Tema
• Gaya Desain
• Gaya Ilustrasi

Dekorasi harus serasi dan ditata secara profesional.

Tipografi harus sesuai dengan gaya desain yang dipilih.

Panel Belakang

Buat karya seni pelengkap yang cocok dengan panel depan.

Panel belakang harus terlihat seperti sisi sebaliknya dari amplop yang sama.

Area Lem

Gunakan hanya warna latar belakang yang cocok.

Jangan letakkan karya seni atau tipografi penting di dalam area lem.

Flap Atas

Lanjutkan latar belakang secara alami.

Flap Bawah

Lanjutkan latar belakang secara alami.

══════════════════════════════════════
4. GAMBAR TEKNIS
══════════════════════════════════════

Template amplop HARUS berisi:

• Garis potong hitam solid tebal
• Garis lipat putus-putus hitam
• Sudut flap melengkung jika sesuai
• Garis luar vektor yang bersih
• Simetri sempurna
• Proporsi akurat
• Pola potong (dieline) datar
• Cetak biru cetak profesional

Dimensi amplop HARUS secara ketat mengikuti bagian Properti di atas.

JANGAN memperkirakan dimensi.

JANGAN mendesain ulang konstruksi.

JANGAN mengubah proporsi.

Ukuran kertas yang dipilih HANYA merupakan lembar pencetakan.

Dimensi amplop tetap tidak berubah.

Posisikan secara otomatis template lengkap di tengah kertas dengan tetap mempertahankan semua proporsi.

══════════════════════════════════════
5. KUALITAS
══════════════════════════════════════

Desain alat tulis profesional

Pola potong (dieline) amplop komersial

Kualitas rekayasa kemasan

Ilustrasi vektor datar

Garis yang sangat bersih

Siap cetak

Penyelarasan sempurna

Presisi tinggi

Resolusi 8K

Latar belakang putih

Tepi yang tajam

══════════════════════════════════════
6. BATASAN KETAT
══════════════════════════════════════

TANPA mockup

TANPA amplop terlipat

TANPA amplop tertutup

TANPA perspektif

TANPA 3D

TANPA bayangan

TANPA gradasi

TANPA tanda air (watermark)

TANPA tabel spesifikasi

TANPA catatan instruksi

TANPA catatan konstruksi

TANPA panah pengukuran

TANPA label

Gambar akhir HARUS menampilkan TEMPLATE PISAU POND (DIE-CUT) AMPLOP TERBUKA YANG LENGKAP dalam satu kesatuan, dengan semua flap terhubung, siap untuk dicetak, dipotong, dilipat, dan dirakit secara profesional.\`;

      res.json({ prompt: outputPrompt });
    } catch (error) {
`;
    fs.writeFileSync('server.ts', codeBefore + newCode + codeAfter);
    console.log("Successfully translated output prompt to Indonesian");
} else {
    console.log("Could not find start/end indices", startIdx, endIdx);
}
