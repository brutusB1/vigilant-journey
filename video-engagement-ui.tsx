// video-engagement-ui.tsx
import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from './components/ui/Card';
import VideoEngagementAnalyzer from './components/VideoEngagementAnalyzer';
import { Upload } from 'lucide-react';

const VideoEngagementUI: React.FC = () => {
  const [processedData, setProcessedData] = useState<any[]>([]);

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const text = await file.text();
    const data = parseCSV(text); // You’ll need to implement parseCSV
    const analyzer = new VideoEngagementAnalyzer(data);
    const processed = analyzer.analyze();
    setProcessedData(processed);
  };

  const parseCSV = (csv: string) => {
    const rows = csv.split('\n').slice(1); // Skip header row
    return rows.map(row => {
      const columns = row.split(',');
      return {
        'Tracking Date Formatted': columns[0],
        'Invites': columns[1],
        'Clicks': columns[2],
        'Plays': columns[3],
        'Play Time (Min)': columns[4],
      };
    });
  };

  return (
    <div style={{ padding: '20px' }}>
      <Card>
        <CardHeader>
          <CardTitle>Video Engagement Analyzer</CardTitle>
        </CardHeader>
        <CardContent>
          <div>
            <label htmlFor="upload">
              <Upload style={{ marginRight: '10px' }} />
              Upload CSV File
            </label>
            <input
              id="upload"
              type="file"
              accept=".csv"
              onChange={handleFileUpload}
              style={{ display: 'none' }}
            />
          </div>

          {processedData.length > 0 && (
            <div style={{ marginTop: '20px' }}>
              <h3>Processed Data:</h3>
              <pre>{JSON.stringify(processedData, null, 2)}</pre>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default VideoEngagementUI;