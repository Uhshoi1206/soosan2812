
import React, { useMemo } from 'react';
import { Truck } from '@/models/TruckTypes';
import { getCategoryName, getBoxTypeName, getTrailerTypeName } from '@/lib/generated/categories';
import { Button } from '@/components/ui/button';
import { useCompare } from '@/contexts/CompareContextAstro';
import { X, Trash2 } from 'lucide-react';
import { OptimizedImage } from '@/components/ui/optimized-image';

interface CompareTableProps {
  trucks: Truck[];
}

// Label mappings cho các field phổ biến
const labelMappings: Record<string, string> = {
  // Basic info
  brand: 'Thương hiệu',
  model: 'Model',
  weightText: 'Tải trọng',
  dimensions: 'Kích thước tổng thể',
  price: 'Giá bán',
  priceText: 'Giá bán',
  origin: 'Xuất xứ',
  tires: 'Lốp xe',
  seats: 'Số chỗ ngồi',
  warranty: 'Bảo hành',

  // Dimensions
  length: 'Chiều dài',
  width: 'Chiều rộng',
  height: 'Chiều cao',
  wheelbase: 'Chiều dài cơ sở',
  groundClearance: 'Khoảng sáng gầm',
  turningRadius: 'Bán kính quay vòng',
  insideDimension: 'Kích thước thùng trong',
  overallDimensions: 'Kích thước tổng thể',
  containerDimensions: 'Kích thước thùng hàng',
  capacity: 'Dung tích/Thể tích',

  // Weight
  weight: 'Trọng lượng',
  grossWeight: 'Tổng tải',
  kerbWeight: 'Trọng lượng không tải',
  curbWeight: 'Khối lượng bản thân',
  payload: 'Tải trọng cho phép',
  frontAxleLoad: 'Tải trọng cầu trước',
  rearAxleLoad: 'Tải trọng cầu sau',

  // Engine
  engineType: 'Loại động cơ',
  engineModel: 'Model động cơ',
  engineCapacity: 'Dung tích động cơ',
  enginePower: 'Công suất',
  engineTorque: 'Mô-men xoắn',
  transmission: 'Hộp số',
  transmissionType: 'Loại hộp số',
  fuelConsumption: 'Mức tiêu thụ nhiên liệu',
  emissionStandard: 'Tiêu chuẩn khí thải',
  horsepower: 'Công suất',
  torque: 'Mô-men xoắn',

  // Chassis
  chassisMaterial: 'Vật liệu khung gầm',
  frameMaterial: 'Vật liệu khung',
  mainBeam: 'Dầm chính',
  frontSuspension: 'Hệ thống treo trước',
  rearSuspension: 'Hệ thống treo sau',
  suspensionType: 'Loại hệ thống treo',
  frontBrake: 'Phanh trước',
  rearBrake: 'Phanh sau',
  parkingBrake: 'Phanh đỗ',
  brakeSystem: 'Hệ thống phanh',
  steeringType: 'Hệ thống lái',

  // Axle
  axleCount: 'Số trục',
  axleType: 'Loại trục',
  axleWeight: 'Tải trọng trục',
  springType: 'Loại nhíp',
  springDimension: 'Kích thước nhíp',
  tireSpec: 'Thông số lốp',
  axleConfiguration: 'Cấu hình trục',

  // Landing gear & Kingpin
  landingGear: 'Chân chống',
  kingpin: 'Đinh kéo',
  kingpinLoad: 'Tải trọng chân chốt',

  // Systems
  electricSystem: 'Hệ thống điện',
  hydraulicSystem: 'Hệ thống thủy lực',

  // Body/Box
  floorMaterial: 'Vật liệu sàn',
  sideWallMaterial: 'Vật liệu thành bên',
  floorType: 'Loại sàn',
  floorThickness: 'Độ dày sàn',
  sideHeight: 'Chiều cao thành bên',

  // Finishing
  paintProcess: 'Quy trình sơn',
  paintColor: 'Màu sơn',

  // Crane specs - Basic
  liftingCapacity: 'Sức nâng',
  liftingCapacityText: 'Sức nâng',
  reachLength: 'Tầm với',
  rotationAngle: 'Góc quay',
  stabilizers: 'Chân chống',
  controlSystem: 'Hệ thống điều khiển',
  boomSections: 'Số đốt cần',
  operatingPressure: 'Áp suất vận hành',
  mountingType: 'Kiểu gắn cẩu',
  cabinPresent: 'Cabin điều khiển',
  remoteControl: 'Điều khiển từ xa',
  maxWorkingHeight: 'Chiều cao làm việc tối đa',
  winchCapacity: 'Sức nâng tời',
  maxLiftingMoment: 'Mô-men nâng tối đa',
  maxLiftingHeight: 'Chiều cao nâng tối đa',
  maxWorkingRadius: 'Bán kính làm việc tối đa',
  craneModelName: 'Model cẩu',
  craneBrand: 'Thương hiệu cẩu',
  maxHeightBelowGround: 'Chiều cao dưới mặt đất',
  slewingAngle: 'Góc xoay',
  slewingSpeed: 'Tốc độ xoay',
  slewingTorque: 'Mô-men xoay',

  // Crane - Boom specs
  boomLength: 'Chiều dài cần',
  boomMinLength: 'Chiều dài cần tối thiểu',
  boomMaxLength: 'Chiều dài cần tối đa',
  boomExtensionTime: 'Thời gian duỗi cần',
  boomRetractionTime: 'Thời gian thu cần',
  boomLiftingAngle: 'Góc nâng cần',
  boomLiftingTime: 'Thời gian nâng cần',
  boomLoweringTime: 'Thời gian hạ cần',

  // Crane - Hydraulic system
  hydraulicOilTankCapacity: 'Dung tích bình dầu thủy lực',
  hydraulicPumpOutput: 'Công suất bơm thủy lực',
  hydraulicPumpType: 'Loại bơm thủy lực',
  hydraulicPressure: 'Áp suất thủy lực',
  maxHydraulicPressure: 'Áp suất thủy lực tối đa',
  hydraulicOilFlow: 'Lưu lượng dầu thủy lực',
  hydraulicCylinder: 'Xi-lanh thủy lực',

  // Crane - Outrigger/Stabilizer specs
  outriggerSpan: 'Khoảng cách chân chống',
  outriggerType: 'Loại chân chống',
  outriggerExtension: 'Độ duỗi chân chống',
  frontOutriggerSpan: 'Khoảng cách chân chống trước',
  rearOutriggerSpan: 'Khoảng cách chân chống sau',
  stabilizerForce: 'Lực chân chống',

  // Crane - Winch specs
  winchType: 'Loại tời',
  winchSpeed: 'Tốc độ tời',
  winchRopeLength: 'Chiều dài dây tời',
  winchRopeDiameter: 'Đường kính dây tời',
  hoistingSpeed: 'Tốc độ nâng',
  loweringSpeed: 'Tốc độ hạ',

  // Crane - Safety & Control
  safetySystem: 'Hệ thống an toàn',
  overloadProtection: 'Bảo vệ quá tải',
  loadMomentLimiter: 'Giới hạn mô-men tải',
  antiTwoBlockSystem: 'Hệ thống chống 2 block',
  powerSource: 'Nguồn động lực',
  foldedHeight: 'Chiều cao khi gập',

  // Crane - Weight specs
  craneWeight: 'Trọng lượng cẩu',
  totalWeight: 'Tổng trọng lượng',
  netWeight: 'Trọng lượng tịnh',

  // Tank specs
  compartments: 'Số ngăn',
  material: 'Vật liệu',
  thickness: 'Độ dày',
  valveSystem: 'Hệ thống van',
  pressureRating: 'Áp suất định mức',
  dischargingSystem: 'Hệ thống xả',
  liningMaterial: 'Vật liệu lót trong',
  safetyEquipment: 'Thiết bị an toàn',
  safetyFeatures: 'Tính năng an toàn',
  insulationPresent: 'Cách nhiệt',
  heatingSystem: 'Hệ thống làm nóng',
  measurementSystem: 'Hệ thống đo lường',
  tankDimension: 'Kích thước bồn',
  designPressure: 'Áp suất thiết kế',
  pumpType: 'Loại bơm',
  pumpFlowRate: 'Lưu lượng bơm',
  flowMeter: 'Đồng hồ đo lưu lượng',
  certifications: 'Chứng nhận',
  capacityText: 'Dung tích',

  // Tractor specs
  clutchType: 'Loại ly hợp',
  cabinType: 'Loại cabin',
  fuelTankCapacity: 'Dung tích bình nhiên liệu',
  saddleHeight: 'Chiều cao bàn đỡ',
  fifthWheelType: 'Loại mâm kéo',
  maxTowingCapacity: 'Tải trọng kéo tối đa',
  brakingSystem: 'Hệ thống phanh',
  retarderSystem: 'Hệ thống hãm',
  sleepingBerth: 'Giường nằm',
  airConditioner: 'Điều hòa không khí',

  // Box structures
  wallLayers: 'Số lớp vách',
  wallMaterials: 'Vật liệu vách',
  floorLayers: 'Số lớp sàn',
  floorMaterials: 'Vật liệu sàn',
  roofLayers: 'Số lớp mái',
  roofMaterials: 'Vật liệu mái',
  doorType: 'Loại cửa',
  doorCount: 'Số lượng cửa',
  insulationThickness: 'Độ dày cách nhiệt',
  refrigerationSystem: 'Hệ thống làm lạnh',
  temperatureRange: 'Phạm vi nhiệt độ',
  coolingUnit: 'Đơn vị làm lạnh',
  compressorType: 'Loại máy nén',
  refrigerantType: 'Loại môi chất lạnh',
  temperatureControl: 'Hệ thống điều khiển nhiệt độ',
  insulationMaterial: 'Vật liệu cách nhiệt',
  outerMaterial: 'Vật liệu bên ngoài',
  innerMaterial: 'Vật liệu bên trong',
  loadingCapacity: 'Khả năng chịu tải',
  frameStructure: 'Cấu trúc khung',
  panelMaterial: 'Vật liệu panel',
  roofType: 'Loại mái',
  loadingSecurity: 'Hệ thống an toàn hàng hóa',
  reinforcement: 'Gia cường',
  waterproofing: 'Chống thấm nước',
  tarpaulinMaterial: 'Vật liệu bạt',
  tarpaulinThickness: 'Độ dày bạt',
  frameType: 'Loại khung',
  sideAccess: 'Khả năng tiếp cận bên hông',
  coverType: 'Loại mui phủ',
  sideType: 'Loại thành bên',

  // Trailer specs
  rampType: 'Loại dốc',
  totalLength: 'Chiều dài tổng thể',
  loadingHeight: 'Chiều cao sàn',
  containerLock: 'Khóa container',

  // Performance
  maxSpeed: 'Tốc độ tối đa',
  climbingAbility: 'Khả năng leo dốc',

  // Man basket / Work platform
  basketCapacity: 'Sức chứa giỏ',
  basketDimensions: 'Kích thước giỏ',
  platformHeight: 'Chiều cao sàn',
  maxPlatformHeight: 'Chiều cao sàn tối đa',
  workingRadius: 'Bán kính làm việc',

  // General equipment
  operatingWeight: 'Trọng lượng vận hành',
  transportDimensions: 'Kích thước vận chuyển',
  operatingDimensions: 'Kích thước vận hành',
  engineBrand: 'Thương hiệu động cơ',
  engineOutput: 'Công suất động cơ',
  fuelType: 'Loại nhiên liệu',
  travelSpeed: 'Tốc độ di chuyển',
  gradability: 'Khả năng leo dốc',
};

// Nhóm thông số theo danh mục
const specCategoryOrder = [
  { key: 'basic', title: 'Thông số cơ bản' },
  { key: 'dimensions', title: 'Kích thước' },
  { key: 'weight', title: 'Trọng lượng' },
  { key: 'chassis', title: 'Khung gầm' },
  { key: 'axleAndSuspension', title: 'Trục & Hệ thống treo' },
  { key: 'systems', title: 'Hệ thống' },
  { key: 'body', title: 'Thùng/Thân xe' },
  { key: 'finishing', title: 'Hoàn thiện' },
  { key: 'engine', title: 'Động cơ & Vận hành' },
  { key: 'craneSpec', title: 'Thông số cẩu' },
  { key: 'trailerSpec', title: 'Thông số sơ mi rơ mooc' },
  { key: 'tractorSpec', title: 'Thông số đầu kéo' },
  { key: 'tankSpec', title: 'Thông số bồn xi téc' },
  { key: 'coolingBox', title: 'Thông số thùng đông lạnh' },
  { key: 'insulatedBox', title: 'Thông số thùng bảo ôn' },
  { key: 'closedBox', title: 'Thông số thùng kín' },
  { key: 'tarpaulinBox', title: 'Thông số thùng bạt' },
  { key: 'flatbedBox', title: 'Thông số thùng lửng' },
  { key: 'specifications', title: 'Thông số kỹ thuật' },
  { key: 'other', title: 'Thông tin khác' },
];

// Fields không hiển thị trong bảng so sánh
const excludedFields = new Set([
  'id', 'slug', 'type', 'boxType', 'trailerType', 'isNew', 'isHot', 'isAvailable',
  'thumbnailUrl', 'images', 'description', 'detailedDescription', 'features', 'faqs',
  'name', 'relatedProducts', 'seoKeywords', 'metaDescription', 'ratedLoadChart',
  'detailedLiftingCapacity', 'optionalFeatures', 'cabinFeatures', 'specialFeatures',
]);

// Hàm chuyển camelCase thành tiếng Việt đọc được
const camelToLabel = (str: string): string => {
  // Kiểm tra mapping trước
  if (labelMappings[str]) return labelMappings[str];

  // Chuyển camelCase thành words
  const result = str
    .replace(/([A-Z])/g, ' $1')
    .replace(/^./, (s) => s.toUpperCase())
    .trim();

  return result;
};

// Hàm lấy label cho một path
const getLabel = (path: string): string => {
  const parts = path.split('.');
  const lastPart = parts[parts.length - 1];
  return labelMappings[lastPart] || camelToLabel(lastPart);
};

// Hàm lấy giá trị nested từ object
const getNestedValue = (obj: any, path: string): any => {
  if (!obj || !path) return undefined;

  const parts = path.split('.');
  let value = obj;

  for (const part of parts) {
    if (value === null || value === undefined) return undefined;
    value = value[part];
  }

  return value;
};

// Hàm format giá trị để hiển thị
const formatValue = (value: any): string => {
  if (value === undefined || value === null) return '-';
  if (typeof value === 'boolean') return value ? 'Có' : 'Không';
  if (Array.isArray(value)) return value.join(', ');
  if (typeof value === 'object') return JSON.stringify(value);
  return String(value);
};

// Hàm format giá tiền
const formatPrice = (price: number): string => {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
    maximumFractionDigits: 0
  }).format(price);
};

// Hàm thu thập tất cả specs từ một object nested
const collectSpecs = (
  obj: any,
  prefix: string,
  result: Map<string, { category: string; path: string; label: string }>
) => {
  if (!obj || typeof obj !== 'object' || Array.isArray(obj)) return;

  for (const key of Object.keys(obj)) {
    if (excludedFields.has(key)) continue;

    const fullPath = prefix ? `${prefix}.${key}` : key;
    const value = obj[key];

    if (value !== null && value !== undefined && typeof value === 'object' && !Array.isArray(value)) {
      // Nested object - recurse into it
      collectSpecs(value, fullPath, result);
    } else {
      // Leaf value - add to result
      const category = prefix.split('.')[0] || 'basic';
      result.set(fullPath, {
        category,
        path: fullPath,
        label: getLabel(fullPath),
      });
    }
  }
};

const CompareTable: React.FC<CompareTableProps> = ({ trucks }) => {
  const { removeFromCompare, clearCompare } = useCompare();

  // Thu thập tất cả specs từ tất cả trucks
  const allSpecs = useMemo(() => {
    const specsMap = new Map<string, { category: string; path: string; label: string }>();

    for (const truck of trucks) {
      // Thu thập các field top-level
      const topLevelFields = ['brand', 'model', 'weightText', 'dimensions', 'priceText', 'origin', 'tires', 'seats', 'warranty'];
      for (const field of topLevelFields) {
        if (truck[field as keyof Truck] !== undefined && truck[field as keyof Truck] !== null) {
          specsMap.set(field, {
            category: 'basic',
            path: field,
            label: labelMappings[field] || field,
          });
        }
      }

      // Thu thập từ specifications
      if (truck.specifications) {
        for (const key of Object.keys(truck.specifications)) {
          if (!excludedFields.has(key)) {
            specsMap.set(`specifications.${key}`, {
              category: 'specifications',
              path: `specifications.${key}`,
              label: getLabel(key),
            });
          }
        }
      }

      // Thu thập từ các spec objects
      const specObjects = [
        'trailerSpec', 'craneSpec', 'tractorSpec', 'tankSpec',
        'coolingBox', 'insulatedBox', 'closedBox', 'tarpaulinBox', 'flatbedBox'
      ];

      for (const specKey of specObjects) {
        const specObj = truck[specKey as keyof Truck];
        if (specObj && typeof specObj === 'object') {
          collectSpecs(specObj, specKey, specsMap);
        }
      }
    }

    return specsMap;
  }, [trucks]);

  // Nhóm specs theo category
  const groupedSpecs = useMemo(() => {
    const groups = new Map<string, Array<{ path: string; label: string }>>();

    for (const [, spec] of allSpecs) {
      const category = spec.category;
      if (!groups.has(category)) {
        groups.set(category, []);
      }
      groups.get(category)!.push({ path: spec.path, label: spec.label });
    }

    // Sắp xếp theo thứ tự đã định nghĩa
    const orderedGroups: Array<{ title: string; specs: Array<{ path: string; label: string }> }> = [];

    for (const { key, title } of specCategoryOrder) {
      const specs = groups.get(key);
      if (specs && specs.length > 0) {
        orderedGroups.push({ title, specs });
      }
    }

    // Thêm các category không nằm trong order list
    for (const [category, specs] of groups) {
      if (!specCategoryOrder.find(c => c.key === category) && specs.length > 0) {
        orderedGroups.push({ title: category, specs });
      }
    }

    return orderedGroups;
  }, [allSpecs]);

  // Hàm lấy giá trị cho một truck và path
  const getValue = (truck: Truck, path: string): string => {
    // Handle special cases
    if (path === 'priceText') {
      return truck.priceText || (typeof truck.price === 'number' ? formatPrice(truck.price) : '-');
    }
    if (path === 'brand') {
      const brand = truck.brand;
      if (!brand) return '-';
      if (Array.isArray(brand)) return brand.join(' & ');
      return String(brand);
    }

    const value = getNestedValue(truck, path);
    return formatValue(value);
  };

  // Kiểm tra xem có ít nhất 1 truck có giá trị cho path không
  const hasAnyValue = (path: string): boolean => {
    return trucks.some(truck => {
      const value = getNestedValue(truck, path);
      return value !== undefined && value !== null && value !== '';
    });
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold">Đang so sánh {trucks.length} xe</h2>
        <Button
          onClick={clearCompare}
          variant="destructive"
          size="sm"
          className="flex items-center gap-2"
        >
          <Trash2 className="h-4 w-4" />
          Xóa tất cả
        </Button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left border-collapse">
          <thead>
            <tr className="bg-gray-100">
              <th className="p-4 w-1/4 border-r-2">Thông tin</th>
              {trucks.map((truck) => (
                <th key={truck.id} className="p-4 relative">
                  <Button
                    className="absolute top-2 right-2 h-6 w-6 p-0 rounded-full"
                    size="sm"
                    variant="ghost"
                    onClick={() => removeFromCompare(truck.id)}
                  >
                    <X className="h-4 w-4" />
                  </Button>

                  <div className="pt-4">
                    <div className="mb-3 flex justify-center">
                      <OptimizedImage
                        src={truck.thumbnailUrl}
                        alt={truck.name}
                        className="w-40 h-28 object-contain"
                        useCase="thumbnail"
                      />
                    </div>
                    <a href={`/${truck.type}/${truck.slug}`} className="font-bold text-lg hover:text-primary transition-colors">
                      {truck.name}
                    </a>
                    <div className="text-xs text-gray-500 mt-1">
                      {getCategoryName(truck.type)}
                      {truck.boxType && <span> - {getBoxTypeName(truck.boxType)}</span>}
                      {truck.trailerType && <span> - {getTrailerTypeName(truck.trailerType)}</span>}
                    </div>
                    <div className="text-lg font-bold text-primary mt-2">
                      {truck.priceText}
                    </div>
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {groupedSpecs.map((group) => (
              <React.Fragment key={group.title}>
                <tr className="bg-gray-50">
                  <td colSpan={trucks.length + 1} className="p-3 font-semibold text-base">
                    {group.title}
                  </td>
                </tr>

                {group.specs.filter(spec => hasAnyValue(spec.path)).map((spec) => (
                  <tr key={spec.path} className="border-b">
                    <td className="p-3 font-medium border-r-2">{spec.label}</td>

                    {trucks.map((truck) => (
                      <td key={`${truck.id}-${spec.path}`} className="p-3 text-center">
                        {getValue(truck, spec.path)}
                      </td>
                    ))}
                  </tr>
                ))}
              </React.Fragment>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default CompareTable;
