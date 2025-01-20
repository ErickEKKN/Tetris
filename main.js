
const board = document.getElementById("board"),
    // array pieces menyimpan semua bentuk balok Tetris yang tersedia,
    //  masing-masing piece sebagai objek dengan properti shape (bentuk) dan color (warna).
    pieces = [
        {
        shape: [
            [1, 1],
            [1, 1],
        ],
        color: "#FFD700",
        },
        { shape: [[1, 1, 1, 1]], color: "#00FFFF" },
        {
        shape: [
            [1, 1, 0],
            [0, 1, 1],
        ],
        color: "#FF0000",
        },
        {
        shape: [
            [0, 1, 1],
            [1, 1, 0],
        ],
        color: "#00FF00",
        },
        {
        shape: [
            [1, 1, 1],
            [0, 1, 0],
        ],
        color: "#800080",
        },
        {
        shape: [
            [1, 1, 1],
            [1, 0, 0],
        ],
        color: "#0000FF",
        },
        {
        shape: [
            [1, 1, 1],
            [0, 0, 1],
        ],
        color: "#FFA500",
        },
    ];

    // Objek state mempertahankan status permainan saat ini, termasuk: 
    // score: Skor pemain. 
    // level: Level permainan saat ini. 
    // lines: Jumlah garis yang berhasil dihapus.
    // board: Array 2D yang mewakili papan permainan.
    // currentPiece: Balok yang sedang jatuh.
    // nextPiece: Balok berikutnya yang akan jatuh.
    let state = {
        score: 0,
        level: 1,
        lines: 0,
        board: Array(20)
            .fill(0)
            .map(() => Array(10).fill(0)),
        currentPiece: null,
        nextPiece: null,
    };

    // Fungsi draw untuk memperbarui papan permainan:
    // Menghapus konten saat ini dari elemen board.
    // Melakukan iterasi melalui array state.board dan membuat elemen div untuk setiap sel.
    // Menetapkan warna latar belakang setiap sel berdasarkan status permainan.
    // Merender balok yang sedang jatuh pada papan.
    const draw = () => {
        board.innerHTML = "";
        state.board.forEach((row, i) =>
            row.forEach((cell, j) => {
            const block = document.createElement("div");
            block.className = "block";
            if (cell) block.style.background = cell;
            board.appendChild(block);
            })
        );
        if (state.currentPiece) {
            state.currentPiece.shape.forEach((row, i) =>
                row.forEach((cell, j) => {
                    if (cell) {
                    const block =
                        board.children[
                        (state.currentPiece.y + i) * 10 + (state.currentPiece.x + j)
                        ];
                    if (block) block.style.background = state.currentPiece.color;
                    }
                })
            );
        }
    };

    // Fungsi startGame menginisialisasi status permainan dan memulai loop permainan: 
    // Mengatur ulang objek state dengan nilai awal.
    // Memanggil fungsi draw untuk merender status awal.
    // Memulai loop permainan dengan setInterval.
    const startGame = () => {
        state = {
            ...state,
            score: 0,
            level: 1,
            lines: 0,
            board: Array(20)
            .fill(0)
            .map(() => Array(10).fill(0)),
            currentPiece: getPiece(),
            nextPiece: getPiece(),
        };
        draw();
        if (window.gameInterval) clearInterval(window.gameInterval);
        window.gameInterval = setInterval(moveDown, 1000);
    };

    //Fungsi resetGame menghentikan loop permainan dan mengatur ulang status permainan ke nilai awalnya.
    const resetGame = () => {
        clearInterval(window.gameInterval);
        state = {
            ...state,
            score: 0,
            level: 1,
            lines: 0,
            board: Array(20)
            .fill(0)
            .map(() => Array(10).fill(0)),
            currentPiece: null,
            nextPiece: null,
        };
        draw();
    };

    // Fungsi untuk mendapatkan balok (piece) acak dalam permainan Tetris
    const getPiece = () => ({
        // Menggunakan spread operator untuk menyalin properti balok acak dari array `pieces`
        ...pieces[Math.floor(Math.random() * pieces.length)],
        x: 4, // Menetapkan posisi awal horizontal balok di tengah papan (kolom ke-4)
        y: 0, // Menetapkan posisi awal vertikal balok di bagian atas papan
    });

    // Fungsi moveDown memindahkan balok yang sedang jatuh ke bawah satu baris.
    // Jika balok tidak bisa bergerak lebih jauh ke bawah, fungsi ini mengunci balok 
    // di tempatnya dan memeriksa garis yang selesai.
    const moveDown = () => {
        if (!state.currentPiece) return;
        if (canMove(0, 1)) state.currentPiece.y++;
        else lockPiece();
        draw();
    };

    // Fungsi canMove memeriksa apakah balok yang sedang jatuh bisa bergerak 
    // sejumlah yang ditentukan (dx, dy) tanpa bertabrakan dengan balok lain atau keluar dari batas.
    const canMove = (dx, dy) => {
        const { shape, x, y } = state.currentPiece;
        return shape.every((row, i) =>
            row.every((cell, j) => {
            if (!cell) return true;
            const newX = x + j + dx,
                newY = y + i + dy;
            return (
                newY < 20 &&
                newX >= 0 &&
                newX < 10 &&
                (!state.board[newY] || !state.board[newY][newX])
            );
            })
        );
    };

    // Fungsi lockPiece mengunci balok yang sedang jatuh di tempatnya pada papan permainan,
    // memeriksa garis yang selesai, dan memperbarui status permainan dengan balok berikutnya.
    const lockPiece = () => {
        const { shape, x, y, color } = state.currentPiece;
        shape.forEach((row, i) =>
            row.forEach((cell, j) => {
            if (cell) state.board[y + i][x + j] = color;
            })
        );
        checkLines();
        state.currentPiece = state.nextPiece;
        state.nextPiece = getPiece();
        if (!canMove(0, 0)) {
            alert("Game Over! Score: " + state.score);
            resetGame();
        }
    };

    // Fungsi checkLines memeriksa dan menghapus garis yang selesai pada papan permainan.
    // Fungsi ini kemudian menggeser garis yang tersisa ke bawah.
    const checkLines = () => {
        state.board = state.board.filter((row) => !row.every((cell) => cell));
        while (state.board.length < 20) state.board.unshift(Array(10).fill(0));
        state.score++;
    };

    // Fungsi rotatePiece memutar balok yang sedang jatuh.
    // Jika rotasi menyebabkan tabrakan, bentuk dan posisi balok dikembalikan ke posisi semula.
    const rotatePiece = () => {
        const { shape } = state.currentPiece;
        const rotatedShape = shape[0].map((_, index) =>
            shape.map((row) => row[index]).reverse()
        );
        const oldX = state.currentPiece.x,
            oldY = state.currentPiece.y;
        state.currentPiece.shape = rotatedShape;
        if (!canMove(0, 0)) {
            state.currentPiece.shape = shape;
            state.currentPiece.x = oldX;
            state.currentPiece.y = oldY;
        }
    };

    // Event Listeners: Tombol start memulai permainan saat diklik.
    // Tombol reset mengatur ulang permainan saat diklik.
    // Event keydown menangani input dari keyboard untuk memindahkan dan memutar balok yang sedang jatuh.
    // Tombol left, right, down, rotate: Menangani klik tombol untuk memindahkan dan memutar balok yang sedang jatuh.
    document.getElementById("start").addEventListener("click", startGame);
    document.getElementById("reset").addEventListener("click", resetGame);
    document.addEventListener("keydown", (e) => {
        if (!state.currentPiece) return;
        if (e.key === "ArrowLeft" || e.key === "a" && canMove(-1, 0)) state.currentPiece.x--;
        if (e.key === "ArrowRight" || e.key === "d" && canMove(1, 0)) state.currentPiece.x++;
        if (e.key === "ArrowDown" || e.key === "s") moveDown();
        if (e.key === "ArrowUp" || e.key === "w") rotatePiece();
        draw();
    });  
    document.getElementById("left").addEventListener("click", () => {
        if (state.currentPiece && canMove(-1, 0)) state.currentPiece.x--;
        draw();
    });
    document.getElementById("right").addEventListener("click", () => {
        if (state.currentPiece && canMove(1, 0)) state.currentPiece.x++;
        draw();
    });
    document.getElementById("down").addEventListener("click", () => {
        moveDown();
    });
    document.getElementById("rotate").addEventListener("click", () => {
        if (state.currentPiece) rotatePiece();
        draw();
    });