<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>Stock Out History Report</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            font-size: 12px;
            margin: 20px;
        }
        .header {
            text-align: center;
            margin-bottom: 30px;
            border-bottom: 2px solid #333;
            padding-bottom: 10px;
        }
        .header h1 {
            margin: 0;
            font-size: 24px;
            color: #333;
        }
        .header p {
            margin: 5px 0;
            color: #666;
        }
        .info {
            margin-bottom: 20px;
        }
        .info p {
            margin: 5px 0;
        }
        .stats {
            display: table;
            width: 100%;
            margin-bottom: 20px;
        }
        .stat-box {
            display: table-cell;
            width: 33.33%;
            padding: 10px;
            text-align: center;
            background: #f5f5f5;
            border: 1px solid #ddd;
        }
        .stat-box .number {
            font-size: 24px;
            font-weight: bold;
            color: #333;
        }
        .stat-box .label {
            font-size: 11px;
            color: #666;
            margin-top: 5px;
        }
        table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 20px;
        }
        th {
            background-color: #f8f9fa;
            color: #333;
            font-weight: bold;
            padding: 10px 8px;
            text-align: left;
            border-bottom: 2px solid #333;
            font-size: 10px;
            text-transform: uppercase;
        }
        td {
            padding: 8px;
            border-bottom: 1px solid #ddd;
        }
        tr:hover {
            background-color: #f9f9f9;
        }
        .text-center {
            text-align: center;
        }
        .badge {
            padding: 3px 8px;
            border-radius: 12px;
            font-size: 10px;
            font-weight: bold;
            display: inline-block;
        }
        .badge-red {
            background: #fee;
            color: #c00;
        }
        .badge-green {
            background: #efe;
            color: #070;
        }
        .badge-yellow {
            background: #ffe;
            color: #880;
        }
        .badge-blue {
            background: #eef;
            color: #00a;
        }
        .footer {
            margin-top: 30px;
            padding-top: 10px;
            border-top: 1px solid #ddd;
            text-align: center;
            font-size: 10px;
            color: #666;
        }
        .no-data {
            text-align: center;
            padding: 40px;
            color: #999;
        }
    </style>
</head>
<body>
    <div class="header">
        <h1>STOCK OUT HISTORY REPORT</h1>
        <p>Manufacturing System - Stock & Production</p>
    </div>

    <div class="info">
        <p><strong>Generated:</strong> {{ now()->format('F d, Y h:i A') }}</p>
        @if($dateFrom || $dateTo)
            <p><strong>Period:</strong> 
                @if($dateFrom && $dateTo)
                    {{ \Carbon\Carbon::parse($dateFrom)->format('M d, Y') }} - {{ \Carbon\Carbon::parse($dateTo)->format('M d, Y') }}
                @elseif($dateFrom)
                    From {{ \Carbon\Carbon::parse($dateFrom)->format('M d, Y') }}
                @else
                    Until {{ \Carbon\Carbon::parse($dateTo)->format('M d, Y') }}
                @endif
            </p>
        @endif
        @if($batchNumber)
            <p><strong>Batch Number:</strong> {{ $batchNumber }}</p>
        @endif
    </div>

    <div class="stats">
        <div class="stat-box">
            <div class="number">{{ $stats['total_transactions'] ?? 0 }}</div>
            <div class="label">Total Transactions</div>
        </div>
        <div class="stat-box">
            <div class="number">{{ $stats['today_transactions'] ?? 0 }}</div>
            <div class="label">Today's Transactions</div>
        </div>
        <div class="stat-box">
            <div class="number">{{ $stats['today_quantity'] ?? 0 }}</div>
            <div class="label">Today's Quantity Out</div>
        </div>
    </div>

    @if(count($transactions) > 0)
        <table>
            <thead>
                <tr>
                    <th>Date/Time</th>
                    <th>Batch Number</th>
                    <th>Product</th>
                    <th>SKU</th>
                    <th class="text-center">Qty Out</th>
                    <th class="text-center">Remaining</th>
                    <th class="text-center">Store Rem.</th>
                    <th>User</th>
                </tr>
            </thead>
            <tbody>
                @foreach($transactions as $tx)
                    <tr>
                        <td>{{ $tx->created_at }}</td>
                        <td><strong>{{ $tx->batch_number }}</strong></td>
                        <td>{{ $tx->product_name }}</td>
                        <td>{{ $tx->product_sku }}</td>
                        <td class="text-center">
                            <span class="badge badge-red">-{{ $tx->quantity }}</span>
                        </td>
                        <td class="text-center">
                            @if($tx->remaining_quantity !== null)
                                <span class="badge {{ $tx->remaining_quantity == 0 ? 'badge-red' : ($tx->remaining_quantity <= 5 ? 'badge-yellow' : 'badge-green') }}">
                                    {{ $tx->remaining_quantity }}
                                </span>
                            @else
                                —
                            @endif
                        </td>
                        <td class="text-center">
                            @if($tx->store_remaining_quantity !== null)
                                <span class="badge {{ $tx->store_remaining_quantity == 0 ? 'badge-red' : ($tx->store_remaining_quantity <= 5 ? 'badge-yellow' : 'badge-blue') }}">
                                    {{ $tx->store_remaining_quantity }}
                                </span>
                            @else
                                —
                            @endif
                        </td>
                        <td>{{ $tx->user_name }}</td>
                    </tr>
                @endforeach
            </tbody>
        </table>
    @else
        <div class="no-data">
            <p>No transactions found for the selected period.</p>
        </div>
    @endif

    <div class="footer">
        <p>This is a computer-generated report. JAAN Network Manufacturing System.</p>
    </div>
</body>
</html>
