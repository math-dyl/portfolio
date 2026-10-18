export type Point3 = readonly [number, number, number];

export function sphereLines(segments = 48): Point3[][] {
  const lines: Point3[][] = [];
  for (let latitude = -3; latitude <= 3; latitude++) {
    const phi = latitude * Math.PI / 8;
    lines.push(Array.from({ length: segments + 1 }, (_, i) => {
      const theta = i / segments * Math.PI * 2;
      return [Math.cos(phi) * Math.cos(theta), Math.sin(phi), Math.cos(phi) * Math.sin(theta)];
    }));
  }
  for (let longitude = 0; longitude < 10; longitude++) {
    const theta = longitude * Math.PI / 10;
    lines.push(Array.from({ length: segments + 1 }, (_, i) => {
      const phi = i / segments * Math.PI * 2;
      return [Math.cos(phi) * Math.cos(theta), Math.sin(phi), Math.cos(phi) * Math.sin(theta)];
    }));
  }
  return lines;
}

export function projectPoint([x, y, z]: Point3, yaw: number, tilt: number, radius: number, output = { x: 0, y: 0, z: 0 }) {
  const rx = x * Math.cos(yaw) + z * Math.sin(yaw);
  const rz = z * Math.cos(yaw) - x * Math.sin(yaw);
  const ry = y * Math.cos(tilt) - rz * Math.sin(tilt);
  const depth = y * Math.sin(tilt) + rz * Math.cos(tilt);
  const perspective = 3.8 / (3.8 - depth);
  output.x = rx * radius * perspective;
  output.y = ry * radius * perspective;
  output.z = depth;
  return output;
}
