
import React from 'react';
import { Truck, getBoxTypeName, getTrailerTypeName } from '@/models/TruckTypes';
import { getCategoryName } from '@/lib/generated/categories';
import { Button } from '@/components/ui/button';
import { useCompare } from '@/contexts/CompareContextAstro';
import { X, Trash2 } from 'lucide-react';
import { OptimizedImage } from '@/components/ui/optimized-image';

interface CompareTableProps {
  trucks: Truck[];
}

// Định nghĩa các nhóm thông số kỹ thuật và thứ tự hiển thị
const specGroups = [
  {
    id: 'basic',
    title: 'Thông số cơ bản',
    specs: [
      { id: 'brand', label: 'Thương hiệu' },
      { id: 'weightText', label: 'Tải trọng' },
      { id: 'dimensions', label: 'Kích thước tổng thể' },
      { id: 'price', label: 'Giá bán', isPrice: true },
      { id: 'origin', label: 'Xuất xứ' },
    ]
  },
  {
    id: 'engine',
    title: 'Động cơ & Vận hành',
    specs: [
      { id: 'engineType', label: 'Loại động cơ' },
      { id: 'engineModel', label: 'Model động cơ' },
      { id: 'engineCapacity', label: 'Dung tích động cơ' },
      { id: 'enginePower', label: 'Công suất' },
      { id: 'engineTorque', label: 'Mô-men xoắn' },
      { id: 'transmission', label: 'Hộp số' },
      { id: 'fuelConsumption', label: 'Mức tiêu thụ nhiên liệu' },
      { id: 'emissionStandard', label: 'Tiêu chuẩn khí thải' },
    ]
  },
  {
    id: 'chassis',
    title: 'Khung gầm & Hệ thống',
    specs: [
      { id: 'wheelbase', label: 'Chiều dài cơ sở', unit: 'm' },
      { id: 'chassisMaterial', label: 'Vật liệu khung gầm' },
      { id: 'frontSuspension', label: 'Hệ thống treo trước' },
      { id: 'rearSuspension', label: 'Hệ thống treo sau' },
      { id: 'frontBrake', label: 'Phanh trước' },
      { id: 'rearBrake', label: 'Phanh sau' },
      { id: 'parkingBrake', label: 'Phanh đỗ' },
      { id: 'steeringType', label: 'Hệ thống lái' },
      { id: 'tires', label: 'Lốp xe' },
    ]
  },
  {
    id: 'dimensions',
    title: 'Kích thước & Trọng lượng',
    specs: [
      { id: 'length', label: 'Chiều dài', unit: 'm' },
      { id: 'width', label: 'Chiều rộng', unit: 'm' },
      { id: 'height', label: 'Chiều cao', unit: 'm' },
      { id: 'insideDimension', label: 'Kích thước thùng trong' },
      { id: 'groundClearance', label: 'Khoảng sáng gầm', unit: 'mm' },
      { id: 'wheelTrack', label: 'Vết bánh xe' },
      { id: 'turningRadius', label: 'Bán kính quay vòng', unit: 'm' },
      { id: 'grossWeight', label: 'Tổng tải' },
      { id: 'kerbWeight', label: 'Trọng lượng không tải' },
      { id: 'frontAxleLoad', label: 'Tải trọng cầu trước' },
      { id: 'rearAxleLoad', label: 'Tải trọng cầu sau' },
    ]
  },
  {
    id: 'performance',
    title: 'Hiệu suất',
    specs: [
      { id: 'maxSpeed', label: 'Tốc độ tối đa' },
      { id: 'climbingAbility', label: 'Khả năng leo dốc' },
    ]
  },
  {
    id: 'coolingBox',
    title: 'Thông số thùng đông lạnh',
    boxType: 'đông-lạnh',
    specs: [
      { id: 'coolingBox.wallLayers', label: 'Số lớp vách' },
      { id: 'coolingBox.wallMaterials', label: 'Vật liệu vách', isArray: true },
      { id: 'coolingBox.floorLayers', label: 'Số lớp sàn' },
      { id: 'coolingBox.floorMaterials', label: 'Vật liệu sàn', isArray: true },
      { id: 'coolingBox.roofLayers', label: 'Số lớp mái' },
      { id: 'coolingBox.roofMaterials', label: 'Vật liệu mái', isArray: true },
      { id: 'coolingBox.doorType', label: 'Loại cửa' },
      { id: 'coolingBox.insulationThickness', label: 'Độ dày cách nhiệt' },
      { id: 'coolingBox.refrigerationSystem', label: 'Hệ thống làm lạnh' },
      { id: 'coolingBox.temperatureRange', label: 'Phạm vi nhiệt độ' },
      { id: 'coolingBox.coolingUnit', label: 'Đơn vị làm lạnh' },
      { id: 'coolingBox.compressorType', label: 'Loại máy nén' },
      { id: 'coolingBox.refrigerantType', label: 'Loại môi chất lạnh' },
      { id: 'coolingBox.temperatureControl', label: 'Hệ thống điều khiển nhiệt độ' },
    ]
  },
  {
    id: 'insulatedBox',
    title: 'Thông số thùng bảo ôn',
    boxType: 'bảo-ôn',
    specs: [
      { id: 'insulatedBox.wallThickness', label: 'Độ dày vách' },
      { id: 'insulatedBox.floorThickness', label: 'Độ dày sàn' },
      { id: 'insulatedBox.roofThickness', label: 'Độ dày mái' },
      { id: 'insulatedBox.insulationMaterial', label: 'Vật liệu cách nhiệt' },
      { id: 'insulatedBox.outerMaterial', label: 'Vật liệu bên ngoài' },
      { id: 'insulatedBox.innerMaterial', label: 'Vật liệu bên trong' },
      { id: 'insulatedBox.doorType', label: 'Loại cửa' },
      { id: 'insulatedBox.doorCount', label: 'Số lượng cửa' },
      { id: 'insulatedBox.temperatureRange', label: 'Phạm vi nhiệt độ duy trì' },
      { id: 'insulatedBox.insideDimension', label: 'Kích thước bên trong' },
      { id: 'insulatedBox.loadingCapacity', label: 'Khả năng chịu tải' },
    ]
  },
  {
    id: 'closedBox',
    title: 'Thông số thùng kín',
    boxType: 'kín',
    specs: [
      { id: 'closedBox.frameStructure', label: 'Cấu trúc khung' },
      { id: 'closedBox.panelMaterial', label: 'Vật liệu panel' },
      { id: 'closedBox.thickness', label: 'Độ dày' },
      { id: 'closedBox.doorType', label: 'Loại cửa' },
      { id: 'closedBox.doorCount', label: 'Số lượng cửa' },
      { id: 'closedBox.roofType', label: 'Loại mái' },
      { id: 'closedBox.floorMaterial', label: 'Vật liệu sàn' },
      { id: 'closedBox.loadingSecurity', label: 'Hệ thống an toàn hàng hóa' },
      { id: 'closedBox.reinforcement', label: 'Gia cường' },
      { id: 'closedBox.waterproofing', label: 'Chống thấm nước' },
    ]
  },
  {
    id: 'tarpaulinBox',
    title: 'Thông số thùng bạt',
    boxType: 'bạt',
    specs: [
      { id: 'tarpaulinBox.frameStructure', label: 'Cấu trúc khung' },
      { id: 'tarpaulinBox.tarpaulinMaterial', label: 'Vật liệu bạt' },
      { id: 'tarpaulinBox.tarpaulinThickness', label: 'Độ dày bạt' },
      { id: 'tarpaulinBox.frameType', label: 'Loại khung' },
      { id: 'tarpaulinBox.sideAccess', label: 'Khả năng tiếp cận từ bên hông' },
      { id: 'tarpaulinBox.coverType', label: 'Loại mui phủ' },
      { id: 'tarpaulinBox.floorMaterial', label: 'Vật liệu sàn' },
    ]
  },
  {
    id: 'flatbedBox',
    title: 'Thông số thùng lửng',
    boxType: 'lửng',
    specs: [
      { id: 'flatbedBox.floorMaterial', label: 'Vật liệu sàn' },
      { id: 'flatbedBox.sideHeight', label: 'Chiều cao thành bên' },
      { id: 'flatbedBox.sideType', label: 'Loại thành bên' },
      { id: 'flatbedBox.sideAccess', label: 'Khả năng tiếp cận bên hông' },
      { id: 'flatbedBox.floorThickness', label: 'Độ dày sàn' },
      { id: 'flatbedBox.reinforcement', label: 'Gia cường' },
    ]
  },
  {
    id: 'tankSpec',
    title: 'Thông số bồn xi téc',
    boxType: 'xi-téc',
    specs: [
      { id: 'tankSpec.capacity', label: 'Dung tích' },
      { id: 'tankSpec.compartments', label: 'Số ngăn' },
      { id: 'tankSpec.material', label: 'Vật liệu' },
      { id: 'tankSpec.thickness', label: 'Độ dày vỏ' },
      { id: 'tankSpec.valveSystem', label: 'Hệ thống van' },
      { id: 'tankSpec.pressureRating', label: 'Áp suất định mức' },
      { id: 'tankSpec.dischargingSystem', label: 'Hệ thống xả' },
      { id: 'tankSpec.liningMaterial', label: 'Vật liệu lót trong' },
      { id: 'tankSpec.safetyEquipment', label: 'Thiết bị an toàn' },
      { id: 'tankSpec.insulationPresent', label: 'Cách nhiệt' },
      { id: 'tankSpec.heatingSystem', label: 'Hệ thống làm nóng' },
      { id: 'tankSpec.measurementSystem', label: 'Hệ thống đo lường' },
    ]
  },
  {
    id: 'craneSpec',
    title: 'Thông số cẩu',
    showForType: 'xe-cau',
    specs: [
      { id: 'craneSpec.craneModelName', label: 'Model cẩu' },
      { id: 'craneSpec.liftingCapacityText', label: 'Sức nâng' },
      { id: 'craneSpec.maxLiftingMoment', label: 'Moment nâng lớn nhất' },
      { id: 'craneSpec.maxLiftingHeight', label: 'Chiều cao nâng tối đa' },
      { id: 'craneSpec.maxWorkingRadius', label: 'Bán kính làm việc tối đa' },
      { id: 'craneSpec.boomType', label: 'Loại cần' },
      { id: 'craneSpec.boomSections', label: 'Số đốt cần' },
      { id: 'craneSpec.boomLength', label: 'Chiều dài cần' },
      { id: 'craneSpec.boomExtensionSpeed', label: 'Tốc độ ra cần' },
      { id: 'craneSpec.boomLuffingAngle', label: 'Góc nâng cần' },
      { id: 'craneSpec.boomLuffingSpeed', label: 'Tốc độ nâng cần' },
      { id: 'craneSpec.winchRatedSpeed', label: 'Tốc độ tời' },
      { id: 'craneSpec.winchRopeType', label: 'Loại cáp tời' },
      { id: 'craneSpec.swingAngle', label: 'Góc xoay' },
      { id: 'craneSpec.swingSpeed', label: 'Tốc độ xoay' },
      { id: 'craneSpec.swingReductionType', label: 'Kiểu giảm tốc xoay' },
      { id: 'craneSpec.outriggersFrontExtension', label: 'Chân chống trước' },
      { id: 'craneSpec.outriggersRearExtension', label: 'Chân chống sau' },
      { id: 'craneSpec.outriggersType', label: 'Loại chân chống' },
      { id: 'craneSpec.hydraulicTankCapacity', label: 'Dung tích thùng dầu' },
      { id: 'craneSpec.hydraulicOilFlow', label: 'Lưu lượng dầu' },
      { id: 'craneSpec.hydraulicOperatingPressure', label: 'Áp suất vận hành' },
    ]
  },
  {
    id: 'trailerSpec',
    title: 'Thông số sơ mi rơ mooc',
    showForType: 'mooc',
    specs: [
      // Kích thước (từ trailerSpec.dimensions)
      { id: 'trailerSpec.dimensions.overallDimensions', label: 'Kích thước tổng thể' },
      { id: 'trailerSpec.dimensions.containerDimensions', label: 'Kích thước lòng thùng' },
      { id: 'trailerSpec.dimensions.wheelbase', label: 'Chiều dài cơ sở' },
      { id: 'trailerSpec.dimensions.capacity', label: 'Thể tích thùng' },
      // Trọng lượng (từ trailerSpec.weight)
      { id: 'trailerSpec.weight.curbWeight', label: 'Khối lượng bản thân' },
      { id: 'trailerSpec.weight.payload', label: 'Tải trọng cho phép' },
      { id: 'trailerSpec.weight.grossWeight', label: 'Khối lượng toàn bộ' },
      { id: 'trailerSpec.weight.kingpinLoad', label: 'Tải trọng chốt kéo' },
      // Kết cấu khung (từ trailerSpec.chassis)
      { id: 'trailerSpec.chassis.mainBeam', label: 'Dầm chính' },
      { id: 'trailerSpec.chassis.frameMaterial', label: 'Vật liệu khung' },
      { id: 'trailerSpec.chassis.landingGear', label: 'Chân chống' },
      { id: 'trailerSpec.chassis.kingpin', label: 'Chốt kéo' },
      // Trục và hệ thống treo (từ trailerSpec.axleAndSuspension)
      { id: 'trailerSpec.axleAndSuspension.axleCount', label: 'Số trục' },
      { id: 'trailerSpec.axleAndSuspension.axleType', label: 'Loại trục' },
      { id: 'trailerSpec.axleAndSuspension.springType', label: 'Loại nhíp' },
      { id: 'trailerSpec.axleAndSuspension.springDimension', label: 'Tiết diện lá nhíp' },
      { id: 'trailerSpec.axleAndSuspension.tireSpec', label: 'Lốp xe' },
      { id: 'trailerSpec.axleAndSuspension.liftingAxle', label: 'Trục nâng hạ' },
      // Hệ thống (từ trailerSpec.systems)
      { id: 'trailerSpec.systems.brakeSystem', label: 'Hệ thống phanh' },
      { id: 'trailerSpec.systems.electricSystem', label: 'Hệ thống điện' },
      { id: 'trailerSpec.systems.hydraulicSystem', label: 'Hệ thống thủy lực' },
      // Thân vỏ (từ trailerSpec.body)
      { id: 'trailerSpec.body.floorMaterial', label: 'Vật liệu sàn' },
      { id: 'trailerSpec.body.sideWallMaterial', label: 'Vật liệu thành thùng' },
      { id: 'trailerSpec.body.containerLocks', label: 'Chốt hãm container' },
      // Hoàn thiện (từ trailerSpec.finishing)
      { id: 'trailerSpec.finishing.paintProcess', label: 'Công nghệ sơn' },
      { id: 'trailerSpec.finishing.paintColor', label: 'Màu sơn' },
      { id: 'trailerSpec.finishing.warranty', label: 'Bảo hành' },
    ]
  },
  {
    id: 'tractorSpec',
    title: 'Thông số đầu kéo',
    showForType: 'dau-keo',
    specs: [
      { id: 'tractorSpec.horsepower', label: 'Công suất (HP)' },
      { id: 'tractorSpec.torque', label: 'Mô-men xoắn' },
      { id: 'tractorSpec.transmission', label: 'Hộp số' },
      { id: 'tractorSpec.transmissionType', label: 'Loại hộp số' },
      { id: 'tractorSpec.clutch', label: 'Ly hợp' },
      { id: 'tractorSpec.axleConfiguration', label: 'Công thức bánh xe' },
      { id: 'tractorSpec.axleCount', label: 'Số trục' },
      { id: 'tractorSpec.cabinType', label: 'Loại cabin' },
      { id: 'tractorSpec.cabinSuspension', label: 'Treo cabin' },
      { id: 'tractorSpec.sleepingBerth', label: 'Giường nằm' },
      { id: 'tractorSpec.sleepingBerthCount', label: 'Số giường' },
      { id: 'tractorSpec.fifthWheelType', label: 'Mâm kéo' },
      { id: 'tractorSpec.maxTowingCapacityText', label: 'Tải trọng kéo tối đa' },
      { id: 'tractorSpec.kerbWeight', label: 'Khối lượng bản thân' },
      { id: 'tractorSpec.fuelTankCapacityText', label: 'Dung tích bình nhiên liệu' },
      { id: 'tractorSpec.brakingSystem', label: 'Hệ thống phanh' },
      { id: 'tractorSpec.exhaustBrake', label: 'Phanh khí xả' },
      { id: 'tractorSpec.frameSpec', label: 'Khung xe' },
      { id: 'tractorSpec.electricSystem', label: 'Hệ thống điện' },
    ]
  },
  {
    id: 'other',
    title: 'Thông tin khác',
    specs: [
      { id: 'seats', label: 'Số chỗ ngồi' },
      { id: 'warranty', label: 'Bảo hành' },
      { id: 'cabinFeatures', label: 'Tính năng cabin', isArray: true },
    ]
  }
];

const CompareTable: React.FC<CompareTableProps> = ({ trucks }) => {
  const { removeFromCompare, clearCompare } = useCompare();

  // Hàm format giá tiền
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
      maximumFractionDigits: 0
    }).format(price);
  };

  // Hàm lấy giá trị của thuộc tính theo đường dẫn sâu
  const getNestedProperty = (obj: any, path: string) => {
    if (!obj || !path) return undefined;

    const parts = path.split('.');
    let value = obj;

    for (const part of parts) {
      if (value === null || value === undefined) return undefined;
      value = value[part];
    }

    return value;
  };

  // Hàm định dạng giá trị của thuộc tính
  const formatValue = (value: any, isArray?: boolean) => {
    if (value === undefined || value === null) return '-';

    if (isArray && Array.isArray(value)) {
      return value.join(', ');
    }

    if (typeof value === 'boolean') {
      return value ? 'Có' : 'Không';
    }

    return value.toString();
  };

  // Hàm format thương hiệu - sửa để hiển thị đẹp hơn
  const formatBrand = (brand: string | string[]) => {
    if (!brand) return '-';

    if (Array.isArray(brand)) {
      // Nếu là mảng, nối bằng " & " để trông tinh tế hơn
      return brand.join(' & ');
    }

    return brand.toString();
  };

  // Hàm lấy giá trị của thuộc tính
  const getPropertyValue = (truck: Truck, propId: string, isPrice?: boolean, unit?: string, isArray?: boolean) => {
    if (!truck) return '-';

    if (propId === 'brand') return formatBrand(truck.brand);
    if (propId === 'weightText') return truck.weightText || '-';
    if (propId === 'dimensions') return truck.dimensions || `${truck.length} x ${truck.width} x ${truck.height} m`;
    if (propId === 'price' && isPrice) return truck.priceText || (typeof truck.price === 'number' ? formatPrice(truck.price) : '-') || '-';

    // Nếu là kích thước có đơn vị
    if ((propId === 'length' || propId === 'width' || propId === 'height' || propId === 'wheelbase') && truck[propId]) {
      return `${truck[propId]} ${unit || 'm'}`;
    }

    // Các thuộc tính lồng nhau (nested properties)
    if (propId.includes('.')) {
      const value = getNestedProperty(truck, propId);
      return formatValue(value, isArray);
    }

    // Các thuộc tính khác trong specifications
    if (truck.specifications && truck.specifications[propId]) {
      return truck.specifications[propId];
    }

    // Các thuộc tính khác
    return formatValue(truck[propId as keyof Truck], isArray);
  };

  // Hàm kiểm tra xem có hiển thị nhóm thông số không
  const shouldShowSpecGroup = (group: any, truckList: Truck[]) => {
    // Hiển thị các nhóm thông số cơ bản
    if (!group.boxType && !group.showForType) return true;

    // Hiển thị nhóm thông số theo loại xe
    if (group.showForType) {
      return truckList.some(truck => truck.type === group.showForType);
    }

    // Hiển thị nhóm thông số theo loại thùng
    if (group.boxType) {
      return truckList.some(truck => truck.boxType === group.boxType);
    }

    return false;
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
            {specGroups.filter(group => shouldShowSpecGroup(group, trucks)).map((group) => (
              <React.Fragment key={group.id}>
                <tr className="bg-gray-50">
                  <td colSpan={trucks.length + 1} className="p-3 font-semibold text-base">
                    {group.title}
                  </td>
                </tr>

                {group.specs.map((spec) => (
                  <tr key={spec.id} className="border-b">
                    <td className="p-3 font-medium border-r-2">{spec.label}</td>

                    {trucks.map((truck) => (
                      <td key={`${truck.id}-${spec.id}`} className="p-3 text-center">
                        {getPropertyValue(truck, spec.id, spec.isPrice, spec.unit, spec.isArray)}
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
