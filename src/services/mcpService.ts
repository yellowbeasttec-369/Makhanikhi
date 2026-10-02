/**
 * Makhanikhi Model Context Protocol (MCP) Server & Bedrock AgentCore Engine
 * Compliant with MCP standard specifications (JSON-RPC 2.0)
 * Designed for informal auto-mechanics in Limpopo, South Africa (Polokwane, Seshego, Mankweng)
 */

export interface McpToolDefinition {
  name: string;
  description: string;
  inputSchema: {
    type: 'object';
    properties: Record<string, any>;
    required: string[];
  };
}

// 1. Core Tool Schemas
export const MCP_TOOLS: McpToolDefinition[] = [
  {
    name: 'diagnose_vehicle_symptom',
    description: 'Analyzes acoustic/symptom notes for specific vehicle make/model/engine, returning failure modes, torque specs, and diagnostic steps.',
    inputSchema: {
      type: 'object',
      properties: {
        vehicle_make: {
          type: 'string',
          description: 'Manufacturer of the vehicle (e.g., Toyota, Ford, Isuzu, VW, Nissan)'
        },
        vehicle_model: {
          type: 'string',
          description: 'Specific vehicle model (e.g., Hilux 2.5 D-4D, Quantum 2.7, Ranger 2.2 TDCi, Polo Vivo 1.4)'
        },
        engine_code: {
          type: 'string',
          description: 'Engine model / code (e.g., 2KD-FTV, 2TR-FE, CLPA, Duratorq, 4JK1)'
        },
        symptom_description: {
          type: 'string',
          description: 'Acoustic sound, vibration, leak, or symptom description (e.g., Metallic knocking noise on cold idle, coolant leak from weep hole, misfire under load)'
        }
      },
      required: ['vehicle_make', 'vehicle_model', 'symptom_description']
    }
  },
  {
    name: 'cross_reference_part_catalog',
    description: 'Digitizes the till-point reference book. Maps vehicle specifications and symptom diagnostic to precise OEM part numbers, aftermarket equivalents (e.g., King, GMB, Ferodo), physical dimensions, and visual diagram URLs.',
    inputSchema: {
      type: 'object',
      properties: {
        vehicle_spec: {
          type: 'string',
          description: 'Vehicle specification and engine (e.g., Toyota Quantum 2014 2TR-FE 2.7, Toyota Hilux 2.5 D-4D 2KD)'
        },
        part_category: {
          type: 'string',
          description: 'Automotive part category or component name (e.g., Water Pump Housing, Big End Bearing Kit, Outer CV Joint Kit, Lower Control Arm Console Bush)'
        },
        brand_preference: {
          type: 'string',
          description: 'Preferred brand tier (e.g., OEM_or_HighQuality_Aftermarket, OEM_Only, Budget_Aftermarket)',
          default: 'OEM_or_HighQuality_Aftermarket'
        }
      },
      required: ['vehicle_spec', 'part_category']
    }
  },
  {
    name: 'check_closed_circuit_erp_stock',
    description: 'Queries real-time or cached inventory databases/ERPs of participating motor spares shops in Limpopo (Polokwane, Seshego, Mankweng).',
    inputSchema: {
      type: 'object',
      properties: {
        part_number: {
          type: 'string',
          description: 'Part number or SKU (e.g., GMB-GWT-118A, CR-4155XP-STD, TOY-11176-0L011, QTM-2TR-COIL)'
        },
        region: {
          type: 'string',
          description: 'Target Limpopo commercial region (e.g., Polokwane_Limpopo, Seshego_Limpopo, Mankweng_Limpopo)',
          default: 'Polokwane_Limpopo'
        }
      },
      required: ['part_number']
    }
  },
  {
    name: 'search_local_spares_inventory',
    description: 'Queries real-time inventory databases of participating motor spares shops in Limpopo (Polokwane, Seshego, Mankweng). (Alias for check_closed_circuit_erp_stock).',
    inputSchema: {
      type: 'object',
      properties: {
        part_name: {
          type: 'string',
          description: 'Name of the automotive spare part (e.g., Big end bearing kit standard, Water pump housing)'
        },
        vehicle_model: {
          type: 'string',
          description: 'Vehicle make and engine code (e.g., Toyota Hilux 2012 D-4D, Quantum 2.7 2TR)'
        },
        region: {
          type: 'string',
          description: 'Target Limpopo commercial region (e.g., Polokwane_Limpopo, Seshego_Limpopo, Mankweng_Limpopo)',
          default: 'Polokwane_Limpopo'
        }
      },
      required: ['part_name', 'vehicle_model']
    }
  },
  {
    name: 'create_voice_spares_order',
    description: 'Triggers a voice-confirmed purchase order, locking funds in escrow and dispatching courier delivery.',
    inputSchema: {
      type: 'object',
      properties: {
        mechanic_id: {
          type: 'string',
          description: 'Unique ID of the ordering technician or workshop'
        },
        supplier_id: {
          type: 'string',
          description: 'Identifier of the chosen parts vendor from check_closed_circuit_erp_stock'
        },
        part_number: {
          type: 'string',
          description: 'Supplier part stock number'
        },
        quantity: {
          type: 'integer',
          description: 'Number of units ordered',
          default: 1
        },
        delivery_address: {
          type: 'string',
          description: 'Driveway, workshop, or roadside coordinate for express courier delivery'
        }
      },
      required: ['mechanic_id', 'supplier_id', 'part_number', 'delivery_address']
    }
  }
];

// Limpopo Participating Spares Vendors Database
export const LIMPOPO_SPARES_INVENTORY = [
  {
    supplier_id: 'SUP-PLK-01',
    supplier_name: 'Polokwane Motor Spares Central',
    branch: 'CBD (Excelsior St & Market)',
    region: 'Polokwane_Limpopo',
    phone: '+27 15 297 3480',
    inventory: [
      {
        part_number: 'CR-4155XP-STD',
        part_name: 'Big End Bearing Kit (Standard)',
        vehicle_model: 'Toyota Hilux 2.5 D-4D (2KD-FTV)',
        brand: 'King Racing / NDC Japan',
        price_zar: 650,
        price_zaru: 650,
        stock_qty: 4,
        delivery_eta_minutes: 25,
        courier_supported: true
      },
      {
        part_number: 'CR-4155XP-025',
        part_name: 'Big End Bearing Kit (0.25mm / 010 Under)',
        vehicle_model: 'Toyota Hilux 2.5 D-4D (2KD-FTV)',
        brand: 'King Bearings',
        price_zar: 680,
        price_zaru: 680,
        stock_qty: 2,
        delivery_eta_minutes: 25,
        courier_supported: true
      },
      {
        part_number: 'TOY-11176-0L011',
        part_name: 'Common Rail Injector Copper Washer & O-Ring Seal Kit',
        vehicle_model: 'Toyota Hilux / Fortuner 2KD/1KD D-4D',
        brand: 'Denso Genuine OEM',
        price_zar: 280,
        price_zaru: 280,
        stock_qty: 12,
        delivery_eta_minutes: 20,
        courier_supported: true
      },
      {
        part_number: 'TYK-2244-HD',
        part_name: 'Heavy Duty 3-Piece Clutch Kit (260mm)',
        vehicle_model: 'Toyota Quantum 2.7 2TR-FE / Hilux',
        brand: 'Exedy Safari Tuff',
        price_zar: 2450,
        price_zaru: 2450,
        stock_qty: 3,
        delivery_eta_minutes: 30,
        courier_supported: true
      },
      {
        part_number: 'GMB-GWT-118A',
        part_name: 'Water Pump Housing & Impeller Assembly (4-Bolt Flange)',
        vehicle_model: 'Toyota Quantum 2014 2TR-FE 2.7',
        brand: 'GMB Japan (Heavy Duty)',
        price_zar: 890,
        price_zaru: 890,
        stock_qty: 5,
        delivery_eta_minutes: 25,
        courier_supported: true
      },
      {
        part_number: 'TOY-16100-79445',
        part_name: 'OEM Water Pump Assembly with Gasket',
        vehicle_model: 'Toyota Quantum 2.7 2TR-FE (2012-2022)',
        brand: 'Toyota Genuine OEM / Aisin',
        price_zar: 1450,
        price_zaru: 1450,
        stock_qty: 2,
        delivery_eta_minutes: 25,
        courier_supported: true
      }
    ]
  },
  {
    supplier_id: 'SUP-SES-02',
    supplier_name: 'Seshego Auto Zone & Spares Hub',
    branch: 'Zone 1 Plaza (Near Taxi Rank)',
    region: 'Seshego_Limpopo',
    phone: '+27 15 223 1192',
    inventory: [
      {
        part_number: 'CR-4155XP-STD',
        part_name: 'Big End Bearing Kit (Standard)',
        vehicle_model: 'Toyota Hilux 2.5 D-4D (2KD-FTV)',
        brand: 'Glacier Vandervell STD',
        price_zar: 620,
        price_zaru: 620,
        stock_qty: 3,
        delivery_eta_minutes: 15,
        courier_supported: true
      },
      {
        part_number: 'QTM-2TR-COIL',
        part_name: 'Direct Ignition Pencil Coil Pack',
        vehicle_model: 'Toyota Quantum 2TR-FE',
        brand: 'Bosch High-Energy',
        price_zar: 450,
        price_zaru: 450,
        stock_qty: 8,
        delivery_eta_minutes: 15,
        courier_supported: true
      },
      {
        part_number: 'CVJ-TOY-088',
        part_name: 'Outer CV Joint Kit with Boot & Grease (30T)',
        vehicle_model: 'Toyota Hilux Vigo 4x4 / 4x2 D-4D',
        brand: 'GSP Heavy Duty',
        price_zar: 790,
        price_zaru: 790,
        stock_qty: 5,
        delivery_eta_minutes: 18,
        courier_supported: true
      },
      {
        part_number: 'VIV-CA-BUSH',
        part_name: 'Heavy Duty Solid Control Arm Console Bushes (Pair)',
        vehicle_model: 'VW Polo Vivo 1.4 / 1.6 CLPA',
        brand: 'Lemförder Germany',
        price_zar: 380,
        price_zaru: 380,
        stock_qty: 6,
        delivery_eta_minutes: 15,
        courier_supported: true
      },
      {
        part_number: 'GMB-GWT-118A',
        part_name: 'Water Pump Housing & Impeller Assembly (4-Bolt Flange)',
        vehicle_model: 'Toyota Quantum 2014 2TR-FE 2.7',
        brand: 'GMB Japan (Heavy Duty)',
        price_zar: 850,
        price_zaru: 850,
        stock_qty: 3,
        delivery_eta_minutes: 15,
        courier_supported: true
      }
    ]
  },
  {
    supplier_id: 'SUP-MNK-03',
    supplier_name: 'Mankweng Taxi & Bakkie Spares Hub',
    branch: 'University Street (Near Turfloop Gate)',
    region: 'Mankweng_Limpopo',
    phone: '+27 15 267 8901',
    inventory: [
      {
        part_number: 'CVJ-TOY-088',
        part_name: 'Outer CV Joint Kit with Boot & Grease (30T)',
        vehicle_model: 'Toyota Hilux Vigo 4x4 / 4x2 D-4D',
        brand: 'Partquip Premium',
        price_zar: 750,
        price_zaru: 750,
        stock_qty: 2,
        delivery_eta_minutes: 20,
        courier_supported: true
      },
      {
        part_number: 'ISZ-KB-FILT',
        part_name: 'Double-Stage Diesel Fuel Filter Cartridge',
        vehicle_model: 'Isuzu D-Max / KB 250 D-Teq 4JK1',
        brand: 'GUD Filters Z334',
        price_zar: 260,
        price_zaru: 260,
        stock_qty: 9,
        delivery_eta_minutes: 15,
        courier_supported: true
      },
      {
        part_number: 'CR-4155XP-STD',
        part_name: 'Big End Bearing Kit (Standard)',
        vehicle_model: 'Toyota Hilux 2.5 D-4D (2KD-FTV)',
        brand: 'NDC Bearings Japan',
        price_zar: 660,
        price_zaru: 660,
        stock_qty: 1,
        delivery_eta_minutes: 22,
        courier_supported: true
      }
    ]
  },
  {
    supplier_id: 'SUP-LAB-04',
    supplier_name: 'Limpopo Diesel & Injector Specialists',
    branch: 'Laboria Industrial (Silica St, Polokwane)',
    region: 'Polokwane_Limpopo',
    phone: '+27 15 293 4000',
    inventory: [
      {
        part_number: 'DEN-095000-5471',
        part_name: 'Remanufactured Common Rail Injector (Bench Tested)',
        vehicle_model: 'Toyota Hilux / Quantum 2.5/3.0 D-4D 2KD',
        brand: 'Denso Certified Exchange',
        price_zar: 2850,
        price_zaru: 2850,
        stock_qty: 4,
        delivery_eta_minutes: 35,
        courier_supported: true
      },
      {
        part_number: 'RNG-PUMP-22',
        part_name: 'Variable Vane Oil Pump Assembly',
        vehicle_model: 'Ford Ranger 2.2 TDCi Duratorq',
        brand: 'Pierburg OEM',
        price_zar: 3200,
        price_zaru: 3200,
        stock_qty: 2,
        delivery_eta_minutes: 30,
        courier_supported: true
      }
    ]
  }
];

// In-memory Escrow Voice Orders Ledger
export interface VoiceOrderRecord {
  order_id: string;
  mechanic_id: string;
  supplier_id: string;
  supplier_name: string;
  part_number: string;
  part_name: string;
  quantity: number;
  total_price_zar: number;
  total_price_zaru: number;
  delivery_address: string;
  escrow_vault_tx: string;
  courier_status: 'dispatched' | 'en_route' | 'delivered';
  courier_eta_minutes: number;
  created_at: string;
}

export const VOICE_ORDERS_LEDGER: VoiceOrderRecord[] = [
  {
    order_id: 'ORD-PLK-9901',
    mechanic_id: 'MECH-KAB-01',
    supplier_id: 'SUP-SES-02',
    supplier_name: 'Seshego Auto Zone & Spares Hub',
    part_number: 'CR-4155XP-STD',
    part_name: 'Big End Bearing Kit (Standard)',
    quantity: 1,
    total_price_zar: 620,
    total_price_zaru: 620,
    delivery_address: 'Stand 412, Zone 4, Seshego, Polokwane',
    escrow_vault_tx: '5KnpwW2m9X8e1JzXq6aRt4uY3pL7hVd9CfbM2vQ1eZbT',
    courier_status: 'en_route',
    courier_eta_minutes: 12,
    created_at: '2026-10-02T12:30:00Z'
  }
];

// Diagnostic Knowledge Base with Authentic South African Automotive Vernacular
export function executeDiagnoseVehicleSymptom(args: {
  vehicle_make: string;
  vehicle_model: string;
  symptom_description: string;
}) {
  const { vehicle_make, vehicle_model, symptom_description } = args;
  const desc = symptom_description.toLowerCase();
  const model = `${vehicle_make} ${vehicle_model}`.toLowerCase();

  // Pattern 1: Toyota Hilux / Quantum 2KD/1KD Diesel Knock on Cold Idle or Sump
  if (
    (desc.includes('knock') || desc.includes('rattle') || desc.includes('metallic') || desc.includes('tapping')) &&
    (model.includes('hilux') || model.includes('quantum') || model.includes('d-4d') || model.includes('2kd') || model.includes('1kd'))
  ) {
    return {
      vehicle: `${vehicle_make} ${vehicle_model}`,
      primary_failure_mode: 'Big-End Connecting Rod Bearing Clearance Wear or Injector Seat Copper Washer Blow-By',
      urgency: 'HIGH - Cease running engine immediately to prevent crank journal gouging or piston seizure',
      vernacular_summary: 'Chief, on that D-4D, a metallic knock from the bottom end on cold idle is classic big-end bearing fatigue (usually cyl 3 or 4 from oil pickup sludge) or severe injector blow-by pressurizing the crankcase.',
      diagnostic_steps: [
        'Step 1: Check oil filler cap while running at idle. If chuffing heavy vapor like a locomotive, copper injector seat washers have blown through.',
        'Step 2: Pull dipstick and check for carbon grit or bronze/silver glitter flakes in 15W-40 oil.',
        'Step 3: Drop the lower steel sump pan (10mm bolts) and inspect oil pickup strainer for carbon mesh blockage.',
        'Step 4: Check rod radial play on crankshaft journals with dial indicator or feeler gauge.'
      ],
      torque_specs: [
        'Connecting Rod Cap Bolts: 25 Nm (18 ft-lb) + 90° torque-to-yield turn',
        'Crankshaft Main Bearing Caps: 50 Nm + 90°',
        'Oil Sump Drain Plug: 34 Nm',
        'Injector Clamp Bolt: 22 Nm (use new OEM copper crush washer)'
      ],
      recommended_parts: [
        'Big End Bearing Kit (Standard or 0.25mm under)',
        'Copper Injector Washer & O-ring Seal Kit (Toyota OEM 11176-0L011)',
        'Heavy-duty RTV Silicone Sump Sealant (ThreeBond / Victor Reinz)',
        'Castrol Magnatec / Caltex Delo 400 15W-40 Oil + GUD Oil Filter'
      ]
    };
  }

  // Pattern 2: Toyota Quantum 2TR-FE Petrol Misfire / Blow-by
  if (
    (model.includes('quantum') || model.includes('2tr') || model.includes('hiace')) &&
    (desc.includes('misfire') || desc.includes('smoke') || desc.includes('rough') || desc.includes('coil') || desc.includes('jerk'))
  ) {
    return {
      vehicle: `${vehicle_make} ${vehicle_model}`,
      primary_failure_mode: 'Ignition Coil Pack Arcing or Fuel Injector Seat O-Ring Leak on Quantum 2TR-FE',
      urgency: 'MEDIUM - Risk of catalytic converter meltdown and rough taxi commercial operation',
      vernacular_summary: 'On the Quantum 2TR taxi engine, high heat over cylinder 3 and 4 causes the pencil coil rubber boots to perish and arc against the spark plug tube. Also check PCV valve hose for oil suction into intake plenum.',
      diagnostic_steps: [
        'Step 1: Run cylinder balance test by unplugging coil harness one by one. Listen for RPM drop.',
        'Step 2: Inspect coil pack shaft for white tracking carbon lines and oil pooling in plug tube.',
        'Step 3: Check spark plug gap (standard: 1.1mm Iridium / Nickel).',
        'Step 4: Measure fuel rail pressure (target 310 - 350 kPa).'
      ],
      torque_specs: [
        'Spark Plugs: 18 Nm',
        'Coil Pack Retaining Bolt: 9 Nm (10mm head)',
        'Intake Manifold to Head: 21 Nm'
      ],
      recommended_parts: [
        'Direct Ignition Pencil Coil Pack (Bosch or Denso)',
        'Denso SK20HR11 Iridium Long Life Spark Plugs',
        'Intake Manifold Gasket Set'
      ]
    };
  }

  // Pattern 3: Clicking noise on turns (CV Joints)
  if (desc.includes('click') || desc.includes('snap') || desc.includes('turn') || desc.includes('lock') || desc.includes('cv')) {
    return {
      vehicle: `${vehicle_make} ${vehicle_model}`,
      primary_failure_mode: 'Worn Outer Constant Velocity (CV) Joint Ball Cage or Perished Neoprene Boot',
      urgency: 'MEDIUM-HIGH - Risk of axle shaft separation and total loss of drive on the road',
      vernacular_summary: 'That rhythmic metallic clicking on full lock under acceleration is the outer CV joint ball cage scalloped from sand contamination after a torn boot.',
      diagnostic_steps: [
        'Step 1: Put steering on full left lock and reverse sharply; repeat on full right lock. The side that knocks louder is the failing joint.',
        'Step 2: Crawl under and inspect CV boot accordion pleats for flung black molybdenum grease.',
        'Step 3: Grasp half-shaft and twist radially; any free play indicates cage spline failure.'
      ],
      torque_specs: [
        'Front Axle Hub Nut: 235 Nm to 280 Nm (peen locking collar into keyway)',
        'Lower Ball Joint to Knuckle: 140 Nm',
        'Tie Rod End Castle Nut: 65 Nm + new split pin'
      ],
      recommended_parts: [
        'Outer CV Joint Kit (including 30-spline joint, boot, moly grease, circlip, axle nut)',
        'Heavy-duty stainless boot band clamps'
      ]
    };
  }

  // Pattern 4: VW Polo Vivo control arm bushes or squeaking over speed humps
  if (model.includes('polo') || model.includes('vivo') || desc.includes('bush') || desc.includes('speed hump') || desc.includes('squeak')) {
    return {
      vehicle: `${vehicle_make} ${vehicle_model}`,
      primary_failure_mode: 'Torn Lower Control Arm Rear Console Bushes (CLPA/CLSA Polo Platform)',
      urgency: 'MEDIUM - Causes severe inside tyre wear and wandering steering under hard braking',
      vernacular_summary: 'Classic Polo Vivo issue in South Africa. The OEM 2-point rubber console bushes tear from township potholes and road ridges. Replace with solid heavy-duty or Audi A1 solid rubber bushes.',
      diagnostic_steps: [
        'Step 1: Have assistant stab brakes at 10 km/h while watching front wheel. If wheel shifts backward in wheelhouse, bush is destroyed.',
        'Step 2: Pry rear console bush housing with crowbar; inspect web tears.',
        'Step 3: Inspect front stabilizer link rods and anti-roll bar D-bushes.'
      ],
      torque_specs: [
        'Console Bush Hex Bracket Bolts: 50 Nm + 90°',
        'Ball Joint to Control Arm Nuts: 20 Nm + 90°',
        'Wheel Wheel Bolts (17mm): 120 Nm'
      ],
      recommended_parts: [
        'Pair of Heavy-Duty Solid Control Arm Console Bushes (Lemförder / Febi Bilstein)',
        'Front Anti-Roll Bar Links'
      ]
    };
  }

  // Pattern 5: Water Pump Leak & Overheating
  if (desc.includes('water') || desc.includes('pump') || desc.includes('weep') || desc.includes('coolant')) {
    return {
      vehicle: `${vehicle_make} ${vehicle_model}`,
      primary_failure_mode: 'Mechanical Water Pump Seal Carbon Erosion & Bearing Free-Play',
      urgency: 'HIGH - Cease driving immediately to avoid cylinder head warping and overheating',
      vernacular_summary: 'Coolant dripping from the water pump weep hole indicates internal mechanical face seal failure and shaft bearing play. Replace the complete water pump assembly with new gasket.',
      diagnostic_steps: [
        'Step 1: Check water pump lower casing with inspection mirror for dried pink/red ethylene glycol coolant crystal tracks.',
        'Step 2: Grasp fan/pulley hub and check for axial and radial bearing wobble.',
        'Step 3: Pressure test cooling system to 1.1 bar (16 psi) with hand pump.'
      ],
      torque_specs: [
        'Water Pump Housing Bolts (M8): 21 Nm',
        'Fan Pulley Hub Retaining Nuts: 16 Nm',
        'Thermostat Housing Bolts: 13 Nm'
      ],
      recommended_parts: [
        'GMB Heavy-Duty Water Pump Assembly (GMB-GWT-118A)',
        'OEM Thermostat & Radiator Pressure Cap',
        'Ethylene Glycol 50/50 Long-Life Coolant Premix'
      ]
    };
  }

  // Generic Diagnostic Fallback
  return {
    vehicle: `${vehicle_make} ${vehicle_model}`,
    primary_failure_mode: 'Mechanical Wear, Sensor Signal Loss or Valvetrain Clearance Anomaly',
    urgency: 'ATTENTION REQUIRED - Complete mechanical verification needed',
    vernacular_summary: `Investigating ${symptom_description} on ${vehicle_make} ${vehicle_model}. Recommended to verify fuel rail pressure, compression, and mechanical clearance before tear-down.`,
    diagnostic_steps: [
      'Step 1: Connect OBD-II scanner to DLC3 port under steering column and read active/pending DTC fault codes.',
      'Step 2: Perform acoustic stethoscope listening test on cylinder head vs. lower crankcase.',
      'Step 3: Check live sensor data: Fuel Rail Pressure (FRP), Mass Airflow (MAF), and Coolant Temp (ECT).'
    ],
    torque_specs: [
      'Refer to manufacturer workshop repair manual for exact year model specs.'
    ],
    recommended_parts: [
      'Genuine or Tier-1 Aftermarket replacement components from vetted Limpopo motor spares.'
    ]
  };
}

// Counter-Dealer Reference Catalog Database
export const TILL_POINT_REFERENCE_CATALOG = [
  {
    category_keywords: ['water pump', 'cooling', 'housing', 'impeller'],
    vehicle_keywords: ['quantum', '2tr', '2.7', 'hiace'],
    vehicle_spec: 'Toyota Quantum 2014 2TR-FE 2.7 Petrol (2005-2022)',
    part_category: 'Water Pump Housing & Impeller Assembly',
    oem_part_number: 'TOY-16100-79445',
    superseded_oem: 'TOY-16100-79285 (Early 3-bolt variant)',
    aftermarket_cross_references: [
      {
        brand: 'GMB Japan (Heavy Duty)',
        part_number: 'GMB-GWT-118A',
        tier: 'Tier-1 High Quality Aftermarket',
        flange_type: '4-Bolt Pulley Mount Flange (Post-2011 standard)',
        indicative_price_zar: 850,
        notes: 'Reinforced cast impeller with silicon carbide mechanical seal'
      },
      {
        brand: 'AISIN (OEM Tier-1 Supplier)',
        part_number: 'AISIN-WPT-140',
        tier: 'OEM Equivalent',
        flange_type: '4-Bolt Pulley Mount Flange',
        indicative_price_zar: 1250,
        notes: 'Identical to genuine factory assembly without Toyota box markup'
      },
      {
        brand: 'Ferodo Aftermarket',
        part_number: 'FER-FWP-3021',
        tier: 'Standard Replacement',
        flange_type: '4-Bolt Pulley Mount Flange',
        indicative_price_zar: 720,
        notes: 'Commercial taxi replacement unit'
      }
    ],
    physical_dimensions: {
      flange_hub_diameter_mm: 55,
      bolt_pattern: '4-Bolt Pulley Mount (68mm Pitch Circle Diameter)',
      impeller_diameter_mm: 62.5,
      impeller_vane_count: 7,
      housing_depth_mm: 112,
      seal_type: 'O-ring groove gasket included'
    },
    diagram_url: '/diagrams/quantum_2tr_water_pump_flange.svg',
    ambiguity_detected: true,
    ambiguity_title: '3-Bolt vs 4-Bolt Pulley Flange Ambiguity',
    visual_confirmation_prompt: "I've pulled up the diagram on screen. Is it the 4-bolt or 3-bolt housing?",
    counter_dealer_notes: 'Quantum 2TR taxis built between 2005-2010 frequently came with 3-bolt pulley hubs, whereas 2011 onward uses the 4-bolt GMB GWT-118A. Check the visual diagram before dispatch.'
  },
  {
    category_keywords: ['bearing', 'rod', 'big end', 'conrod', 'knock'],
    vehicle_keywords: ['hilux', 'fortuner', '2kd', '1kd', 'd-4d', '2.5'],
    vehicle_spec: 'Toyota Hilux 2.5 D-4D (2KD-FTV / 1KD-FTV)',
    part_category: 'Big End Connecting Rod Bearing Kit',
    oem_part_number: 'TOY-13041-30020-02 (Standard Size Mark 2)',
    superseded_oem: 'TOY-13041-0L010',
    aftermarket_cross_references: [
      {
        brand: 'King Racing / Bearings XP',
        part_number: 'CR-4155XP-STD',
        tier: 'Tri-Metal High Performance Aftermarket',
        flange_type: 'Standard Crank Journal (53.00 mm)',
        indicative_price_zar: 650,
        notes: 'High-fatigue copper-lead matrix resists diesel soot wash'
      },
      {
        brand: 'Glacier Vandervell STD',
        part_number: 'GLACIER-B4785-STD',
        tier: 'OEM Replacement Aftermarket',
        flange_type: 'Standard Crank Journal (53.00 mm)',
        indicative_price_zar: 620,
        notes: 'OEM OE-spec babbitt overlay'
      },
      {
        brand: 'King Bearings (0.25 Under)',
        part_number: 'CR-4155XP-025',
        tier: '0.25mm / 0.010 Undersize',
        flange_type: 'Reground Crank Journal (52.75 mm)',
        indicative_price_zar: 680,
        notes: 'Required if crankshaft journal was gouged and turned on lathe'
      }
    ],
    physical_dimensions: {
      crank_journal_diameter_mm: '53.000 (STD) / 52.750 (0.25mm Under)',
      housing_bore_diameter_mm: 56.000,
      bearing_shell_width_mm: 21.000,
      wall_thickness_mm: 1.488,
      locating_lug_position: 'Offset tang on parting line'
    },
    diagram_url: '/diagrams/hilux_2kd_big_end_bearing_diagram.svg',
    ambiguity_detected: true,
    ambiguity_title: 'Standard (53.00mm) vs 0.25mm Undersize Journal',
    visual_confirmation_prompt: "I've pulled up the bearing journal spec diagram on screen. Has the crank been cut to 0.25mm or is it Standard?",
    counter_dealer_notes: 'Check crank journal with micrometer. If scoring exists on cyl 3 or 4, specify CR-4155XP-025 and send crank for machining.'
  },
  {
    category_keywords: ['cv joint', 'cv', 'axle', 'boot', 'click'],
    vehicle_keywords: ['hilux', 'vigo', '4x4', 'bakkie'],
    vehicle_spec: 'Toyota Hilux Vigo 4x4 / 4x2 D-4D (KUN25/KUN26)',
    part_category: 'Outer Constant Velocity (CV) Joint Kit',
    oem_part_number: 'TOY-43460-09K10',
    superseded_oem: 'TOY-43430-0K020',
    aftermarket_cross_references: [
      {
        brand: 'GSP Heavy Duty',
        part_number: 'CVJ-TOY-088',
        tier: 'Tier-1 Heavy Duty Aftermarket',
        flange_type: '30-Spline External Wheel Hub',
        indicative_price_zar: 790,
        notes: 'Induction-hardened chrome-moly ball tracks with grease & boot'
      },
      {
        brand: 'Partquip Premium',
        part_number: 'PARTQUIP-CVJ-TOY-088',
        tier: 'Commercial Fleet Grade',
        flange_type: '30-Spline External Wheel Hub',
        indicative_price_zar: 750,
        notes: 'Includes axle locknut, internal circlip, and heavy duty band clamps'
      }
    ],
    physical_dimensions: {
      external_teeth_wheel_side: 30,
      internal_teeth_differential_side: 29,
      seal_diameter_mm: 65.0,
      abs_ring_tooth_count: '48-Tooth Tone Ring / Magnetic'
    },
    diagram_url: '/diagrams/hilux_cv_joint_assembly.svg',
    ambiguity_detected: true,
    ambiguity_title: '30-Tooth External Spline vs ABS Tone Ring Type',
    visual_confirmation_prompt: "Diagram displayed on screen. Confirm if your Hilux hub has the 48-tooth ABS tone ring or standard non-ABS.",
    counter_dealer_notes: 'Inspect wheel side splines. 4x4 Hilux Vigo uses 30 teeth; 2WD single-cab workhorses sometimes use 26 teeth.'
  }
];

// 2. Counter-Dealer Catalog Cross-Reference Function
export function executeCrossReferencePartCatalog(args: {
  vehicle_spec: string;
  part_category: string;
  brand_preference?: string;
}) {
  const queryVeh = (args.vehicle_spec || '').toLowerCase();
  const queryPart = (args.part_category || '').toLowerCase();

  // Find best match in catalog
  let matchedEntry = TILL_POINT_REFERENCE_CATALOG.find(entry => {
    const partMatch = entry.category_keywords.some(k => queryPart.includes(k));
    const vehMatch = entry.vehicle_keywords.some(k => queryVeh.includes(k));
    return partMatch && vehMatch;
  });

  // Fallback to closest part match if vehicle not strict
  if (!matchedEntry) {
    matchedEntry = TILL_POINT_REFERENCE_CATALOG.find(entry => 
      entry.category_keywords.some(k => queryPart.includes(k)) ||
      entry.part_category.toLowerCase().includes(queryPart)
    );
  }

  // If still not matched, return smart till-point counter record
  if (!matchedEntry) {
    matchedEntry = TILL_POINT_REFERENCE_CATALOG[0]; // Water pump fallback
  }

  return {
    matched_vehicle: matchedEntry.vehicle_spec,
    part_category: matchedEntry.part_category,
    oem_part_number: matchedEntry.oem_part_number,
    superseded_oem: matchedEntry.superseded_oem,
    aftermarket_cross_references: matchedEntry.aftermarket_cross_references,
    physical_dimensions: matchedEntry.physical_dimensions,
    diagram_url: matchedEntry.diagram_url,
    ambiguity_detected: matchedEntry.ambiguity_detected,
    ambiguity_title: matchedEntry.ambiguity_title,
    visual_confirmation_prompt: matchedEntry.visual_confirmation_prompt,
    counter_dealer_notes: matchedEntry.counter_dealer_notes,
    action_instruction: matchedEntry.ambiguity_detected
      ? `INSTRUCT_MULTIMODAL_UI: Display visual diagram ${matchedEntry.diagram_url}. Prompt mechanic verbally: "${matchedEntry.visual_confirmation_prompt}"`
      : 'SPEC_VERIFIED: Exact OEM-to-aftermarket cross match verified in catalog.'
  };
}

// 3. Closed-Circuit ERP Stock Query Implementation
export function executeCheckClosedCircuitErpStock(args: {
  part_number: string;
  region?: string;
}) {
  const queryPart = (args.part_number || '').trim().toLowerCase();
  const targetRegion = args.region || 'Polokwane_Limpopo';

  const matches: Array<{
    supplier_id: string;
    supplier_name: string;
    branch: string;
    region: string;
    phone: string;
    part_number: string;
    part_name: string;
    brand: string;
    price_zar: number;
    price_zaru: number;
    stock_qty: number;
    delivery_eta_minutes: number;
  }> = [];

  for (const vendor of LIMPOPO_SPARES_INVENTORY) {
    for (const item of vendor.inventory) {
      const isExactOrPrefix = 
        item.part_number.toLowerCase().includes(queryPart) ||
        queryPart.includes(item.part_number.toLowerCase()) ||
        item.part_name.toLowerCase().includes(queryPart);

      if (isExactOrPrefix) {
        matches.push({
          supplier_id: vendor.supplier_id,
          supplier_name: vendor.supplier_name,
          branch: vendor.branch,
          region: vendor.region,
          phone: vendor.phone,
          part_number: item.part_number,
          part_name: item.part_name,
          brand: item.brand,
          price_zar: item.price_zar,
          price_zaru: item.price_zaru,
          stock_qty: item.stock_qty,
          delivery_eta_minutes: item.delivery_eta_minutes
        });
      }
    }
  }

  // Fallback if part number not in stock
  if (matches.length === 0) {
    const defaultVendor = LIMPOPO_SPARES_INVENTORY[0];
    matches.push({
      supplier_id: defaultVendor.supplier_id,
      supplier_name: defaultVendor.supplier_name,
      branch: defaultVendor.branch,
      region: defaultVendor.region,
      phone: defaultVendor.phone,
      part_number: args.part_number,
      part_name: `${args.part_number} (Closed-Circuit Warehouse Order)`,
      brand: 'Certified Tier-1 Aftermarket Supplier',
      price_zar: 890,
      price_zaru: 890,
      stock_qty: 2,
      delivery_eta_minutes: 35
    });
  }

  return {
    query: {
      part_number: args.part_number,
      region: targetRegion
    },
    erp_system_status: 'ONLINE (Limpopo Regional Multi-Store Link)',
    results_count: matches.length,
    participating_vendors_found: Array.from(new Set(matches.map(m => m.supplier_name))),
    matches
  };
}

// Spares Search Alias for backward compatibility
export function executeSearchLocalSparesInventory(args: {
  part_name: string;
  vehicle_model: string;
  region?: string;
}) {
  return executeCheckClosedCircuitErpStock({
    part_number: args.part_name,
    region: args.region
  });
}

// Voice Order Execution with Escrow Lock
export function executeCreateVoiceSparesOrder(args: {
  mechanic_id: string;
  supplier_id: string;
  part_number: string;
  quantity?: number;
  delivery_address: string;
}) {
  const qty = args.quantity || 1;
  
  // Find vendor and part
  let matchedVendor = LIMPOPO_SPARES_INVENTORY.find(v => v.supplier_id === args.supplier_id);
  let matchedPart = matchedVendor?.inventory.find(i => i.part_number === args.part_number);

  // If not found in primary search, create compliant mock transaction
  if (!matchedVendor || !matchedPart) {
    matchedVendor = LIMPOPO_SPARES_INVENTORY[0];
    matchedPart = matchedVendor.inventory[0];
  }

  const unitPriceZar = matchedPart.price_zar;
  const totalPriceZar = unitPriceZar * qty;
  const totalPriceZaru = totalPriceZar; // 1:1 Stablecoin pegged to ZAR

  const orderId = `ORD-VOICE-${Date.now().toString().slice(-6)}`;
  // Solana / Blockchain Anchor Escrow PDA Transaction Hash
  const escrowTx = `5Knpw${Math.random().toString(36).substring(2, 10)}Xq6aRt4uY3pL7hVd9CfbM2vQ1eZbT`;

  const orderRecord: VoiceOrderRecord = {
    order_id: orderId,
    mechanic_id: args.mechanic_id,
    supplier_id: matchedVendor.supplier_id,
    supplier_name: matchedVendor.supplier_name,
    part_number: matchedPart.part_number,
    part_name: matchedPart.part_name,
    quantity: qty,
    total_price_zar: totalPriceZar,
    total_price_zaru: totalPriceZaru,
    delivery_address: args.delivery_address,
    escrow_vault_tx: escrowTx,
    courier_status: 'dispatched',
    courier_eta_minutes: matchedPart.delivery_eta_minutes || 20,
    created_at: new Date().toISOString()
  };

  VOICE_ORDERS_LEDGER.unshift(orderRecord);

  // Spoken voice summary (concise, authoritative, stating supplier, price ZAR/ZARU, ETA)
  const voiceReadout = `Order ${orderId} confirmed! ${qty} unit of ${matchedPart.part_name} from ${matchedVendor.supplier_name} for R${totalPriceZar} ZAR (or ${totalPriceZaru} ZARU stablecoin). Funds locked in Smart Escrow PDA. Courier dispatched to ${args.delivery_address}. Estimated arrival is ${orderRecord.courier_eta_minutes} minutes. Keep your hands on the tools, Chief!`;

  return {
    success: true,
    order: orderRecord,
    escrow: {
      status: 'funds_locked_in_vault',
      pda_account: '9xPQM...escrow_vault',
      transaction_hash: escrowTx,
      currency_zar: totalPriceZar,
      currency_zaru: totalPriceZaru
    },
    courier: {
      carrier: 'Makhanikhi Express Motorcycle / Bakkie Dispatch (Limpopo)',
      origin_branch: matchedVendor.branch,
      destination: args.delivery_address,
      eta_minutes: orderRecord.courier_eta_minutes,
      tracking_status: 'courier_assigned_and_loading'
    },
    voice_spoken_response: voiceReadout
  };
}

// Master MCP Request Dispatcher (JSON-RPC 2.0)
export function handleMcpJsonRpcRequest(rpcRequest: {
  jsonrpc?: string;
  id?: string | number;
  method: string;
  params?: any;
}) {
  const { method, params, id = 1 } = rpcRequest;

  switch (method) {
    case 'initialize':
      return {
        jsonrpc: '2.0',
        id,
        result: {
          protocolVersion: '2024-11-05',
          serverInfo: {
            name: 'makhanikhi-bedrock-mcp-server',
            version: '1.0.0',
            description: 'Makhanikhi Hands-Free Alexa+ Model Context Protocol (MCP) Server for Limpopo Informal Mechanics'
          },
          capabilities: {
            tools: {
              listChanged: false
            }
          }
        }
      };

    case 'tools/list':
      return {
        jsonrpc: '2.0',
        id,
        result: {
          tools: MCP_TOOLS
        }
      };

    case 'tools/call': {
      const toolName = params?.name;
      const toolArgs = params?.arguments || {};

      let executionResult: any;

      if (toolName === 'diagnose_vehicle_symptom') {
        executionResult = executeDiagnoseVehicleSymptom(toolArgs);
      } else if (toolName === 'cross_reference_part_catalog') {
        executionResult = executeCrossReferencePartCatalog(toolArgs);
      } else if (toolName === 'check_closed_circuit_erp_stock') {
        executionResult = executeCheckClosedCircuitErpStock(toolArgs);
      } else if (toolName === 'search_local_spares_inventory') {
        executionResult = executeSearchLocalSparesInventory(toolArgs);
      } else if (toolName === 'create_voice_spares_order') {
        executionResult = executeCreateVoiceSparesOrder(toolArgs);
      } else {
        return {
          jsonrpc: '2.0',
          id,
          error: {
            code: -32601,
            message: `Tool '${toolName}' not found on Makhanikhi MCP server.`
          }
        };
      }

      return {
        jsonrpc: '2.0',
        id,
        result: {
          content: [
            {
              type: 'text',
              text: JSON.stringify(executionResult, null, 2)
            }
          ]
        }
      };
    }

    default:
      return {
        jsonrpc: '2.0',
        id,
        error: {
          code: -32601,
          message: `Method '${method}' not supported.`
        }
      };
  }
}
