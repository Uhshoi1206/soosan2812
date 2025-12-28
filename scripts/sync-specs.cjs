/**
 * Script đồng bộ hóa thông số kỹ thuật sản phẩm
 * - Làm phẳng cấu trúc dữ liệu lồng nhau trong trailerSpec
 * - Bổ sung thông số "số trục" (axleCount) cho các sản phẩm có cơ cấu trục
 * 
 * Usage: node scripts/sync-specs.cjs
 */

const fs = require('fs');
const path = require('path');

const PRODUCTS_DIR = path.join(__dirname, '..', 'src', 'content', 'products');

// Thống kê
let stats = {
    totalFiles: 0,
    modifiedFiles: 0,
    addedAxleCount: 0,
    flattenedTrailerSpec: 0,
    errors: []
};

/**
 * Làm phẳng object trailerSpec từ cấu trúc lồng nhau
 * Ví dụ: trailerSpec.dimensions.overallDimensions -> trailerSpec.overallDimensions
 */
function flattenTrailerSpec(trailerSpec) {
    if (!trailerSpec) return null;

    const flattened = {};

    // Copy các thuộc tính đã phẳng sẵn
    for (const [key, value] of Object.entries(trailerSpec)) {
        if (typeof value !== 'object' || value === null || Array.isArray(value)) {
            flattened[key] = value;
        }
    }

    // Làm phẳng dimensions
    if (trailerSpec.dimensions && typeof trailerSpec.dimensions === 'object') {
        for (const [key, value] of Object.entries(trailerSpec.dimensions)) {
            flattened[key] = value;
        }
    }

    // Làm phẳng weight
    if (trailerSpec.weight && typeof trailerSpec.weight === 'object') {
        for (const [key, value] of Object.entries(trailerSpec.weight)) {
            flattened[key] = value;
        }
    }

    // Làm phẳng chassis
    if (trailerSpec.chassis && typeof trailerSpec.chassis === 'object') {
        for (const [key, value] of Object.entries(trailerSpec.chassis)) {
            flattened[key] = value;
        }
    }

    // Làm phẳng axleAndSuspension
    if (trailerSpec.axleAndSuspension && typeof trailerSpec.axleAndSuspension === 'object') {
        for (const [key, value] of Object.entries(trailerSpec.axleAndSuspension)) {
            flattened[key] = value;
        }
    }

    // Làm phẳng systems
    if (trailerSpec.systems && typeof trailerSpec.systems === 'object') {
        for (const [key, value] of Object.entries(trailerSpec.systems)) {
            flattened[key] = value;
        }
    }

    // Làm phẳng body
    if (trailerSpec.body && typeof trailerSpec.body === 'object') {
        for (const [key, value] of Object.entries(trailerSpec.body)) {
            flattened[key] = value;
        }
    }

    // Làm phẳng finishing
    if (trailerSpec.finishing && typeof trailerSpec.finishing === 'object') {
        for (const [key, value] of Object.entries(trailerSpec.finishing)) {
            flattened[key] = value;
        }
    }

    // Làm phẳng tank (cho mooc xi téc)
    if (trailerSpec.tank && typeof trailerSpec.tank === 'object') {
        for (const [key, value] of Object.entries(trailerSpec.tank)) {
            flattened[key] = value;
        }
    }

    // Làm phẳng cargo (cho mooc chở hàng đặc biệt)
    if (trailerSpec.cargo && typeof trailerSpec.cargo === 'object') {
        for (const [key, value] of Object.entries(trailerSpec.cargo)) {
            flattened[key] = value;
        }
    }

    return flattened;
}

/**
 * Xác định số trục từ dữ liệu sản phẩm
 */
function determineAxleCount(product) {
    // Nếu đã có axleCount, giữ nguyên
    if (product.axleCount) return product.axleCount;
    if (product.trailerSpec?.axleCount) return product.trailerSpec.axleCount;
    if (product.trailerSpec?.axleAndSuspension?.axleCount) return product.trailerSpec.axleAndSuspension.axleCount;

    // Thử xác định từ tên sản phẩm
    const name = (product.name || '').toLowerCase();
    const description = (product.description || '').toLowerCase();
    const text = name + ' ' + description;

    // Pattern matching cho số trục
    if (text.includes('4 trục') || text.includes('bốn trục')) return 4;
    if (text.includes('3 trục') || text.includes('ba trục') || text.includes('3 chân')) return 3;
    if (text.includes('2 trục') || text.includes('hai trục') || text.includes('2 chân')) return 2;

    // Pattern matching cho loại xe (ước tính mặc định)
    if (product.type === 'mooc') {
        // Mooc thường có 3 trục
        return 3;
    }

    if (product.type === 'dau-keo') {
        // Đầu kéo thường có 3 trục (6x4) hoặc 2 trục (4x2)
        const tractorSpec = product.tractorSpec || {};
        const axleConfig = tractorSpec.axleConfiguration || '';
        if (axleConfig.includes('6x4') || axleConfig.includes('6x6')) return 3;
        if (axleConfig.includes('4x2') || axleConfig.includes('4x4')) return 2;
        if (axleConfig.includes('8x4') || axleConfig.includes('8x8')) return 4;

        // Kiểm tra trong tên
        if (name.includes('4 chân') || name.includes('4-chan') || name.includes('bốn chân')) return 4;
        if (name.includes('3 chân') || name.includes('3-chan') || name.includes('ba chân')) return 3;

        return null; // Không xác định được
    }

    if (product.type === 'xe-tai') {
        // Xe tải dựa vào tên
        if (name.includes('4 chân') || name.includes('bốn chân')) return 4;
        if (name.includes('3 chân') || name.includes('ba chân')) return 3;
        if (name.includes('2 chân') || name.includes('hai chân')) return 2;

        // Ước tính theo tải trọng
        const weight = product.weight || 0;
        if (weight >= 15) return 4; // Xe 15 tấn trở lên thường 4 chân
        if (weight >= 8) return 3;   // Xe 8-15 tấn thường 3 chân
        if (weight >= 1) return 2;   // Xe dưới 8 tấn thường 2 chân

        return null;
    }

    return null; // Các loại khác không xác định
}

/**
 * Xử lý một file JSON sản phẩm
 */
function processProductFile(filePath) {
    try {
        const content = fs.readFileSync(filePath, 'utf8');
        const product = JSON.parse(content);
        let modified = false;

        // 1. Làm phẳng trailerSpec nếu có
        if (product.trailerSpec) {
            const hasNestedStructure =
                product.trailerSpec.dimensions ||
                product.trailerSpec.weight ||
                product.trailerSpec.chassis ||
                product.trailerSpec.axleAndSuspension ||
                product.trailerSpec.systems ||
                product.trailerSpec.body ||
                product.trailerSpec.finishing ||
                product.trailerSpec.tank ||
                product.trailerSpec.cargo;

            if (hasNestedStructure) {
                product.trailerSpec = flattenTrailerSpec(product.trailerSpec);
                modified = true;
                stats.flattenedTrailerSpec++;
            }
        }

        // 2. Bổ sung axleCount nếu chưa có và xác định được
        const shouldHaveAxleCount = ['mooc', 'dau-keo', 'xe-tai'].includes(product.type);

        if (shouldHaveAxleCount) {
            const currentAxleCount = product.axleCount || product.trailerSpec?.axleCount || product.tractorSpec?.axleCount;

            if (!currentAxleCount) {
                const determinedAxleCount = determineAxleCount(product);

                if (determinedAxleCount) {
                    // Đặt axleCount vào đúng vị trí theo loại xe
                    if (product.type === 'mooc' && product.trailerSpec) {
                        product.trailerSpec.axleCount = determinedAxleCount;
                    } else if (product.type === 'dau-keo' && product.tractorSpec) {
                        if (!product.tractorSpec.axleCount) {
                            product.tractorSpec.axleCount = determinedAxleCount;
                        }
                    } else {
                        product.axleCount = determinedAxleCount;
                    }

                    modified = true;
                    stats.addedAxleCount++;
                    console.log(`  + Thêm axleCount=${determinedAxleCount} cho: ${product.name}`);
                }
            }
        }

        // 3. Ghi file nếu có thay đổi
        if (modified) {
            fs.writeFileSync(filePath, JSON.stringify(product, null, 2), 'utf8');
            stats.modifiedFiles++;
        }

        stats.totalFiles++;

    } catch (error) {
        stats.errors.push({ file: filePath, error: error.message });
        console.error(`  ❌ Lỗi xử lý file: ${filePath}`, error.message);
    }
}

/**
 * Duyệt qua tất cả thư mục sản phẩm
 */
function processAllProducts() {
    console.log('🔄 Bắt đầu đồng bộ hóa thông số kỹ thuật sản phẩm...\n');

    const categories = fs.readdirSync(PRODUCTS_DIR);

    for (const category of categories) {
        const categoryPath = path.join(PRODUCTS_DIR, category);

        if (!fs.statSync(categoryPath).isDirectory()) continue;

        console.log(`📁 Xử lý danh mục: ${category}`);

        const files = fs.readdirSync(categoryPath).filter(f => f.endsWith('.json'));

        for (const file of files) {
            const filePath = path.join(categoryPath, file);
            processProductFile(filePath);
        }

        console.log(`   ✅ Đã xử lý ${files.length} file\n`);
    }

    // In thống kê
    console.log('\n========== THỐNG KÊ ==========');
    console.log(`📊 Tổng số file: ${stats.totalFiles}`);
    console.log(`✏️  File đã sửa: ${stats.modifiedFiles}`);
    console.log(`🔧 Làm phẳng trailerSpec: ${stats.flattenedTrailerSpec}`);
    console.log(`➕ Thêm axleCount: ${stats.addedAxleCount}`);

    if (stats.errors.length > 0) {
        console.log(`\n❌ Lỗi: ${stats.errors.length}`);
        stats.errors.forEach(e => console.log(`   - ${e.file}: ${e.error}`));
    }

    console.log('\n✅ Hoàn thành đồng bộ hóa!');
}

// Chạy script
processAllProducts();
