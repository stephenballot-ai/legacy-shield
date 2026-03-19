import sys
import json
import os
from google.oauth2 import service_account
from googleapiclient.discovery import build
from datetime import datetime, timedelta

# Path to your service account key
KEY_FILE = '.secrets/gsc-service-account.json'
SITE_URL = 'https://legacyshield.eu' # Actual site URL

def get_gsc_data():
    if not os.path.exists(KEY_FILE):
        return {"error": f"Credentials file not found at {KEY_FILE}"}

    try:
        credentials = service_account.Credentials.from_service_account_file(
            KEY_FILE,
            scopes=['https://www.googleapis.com/auth/webmasters.readonly']
        )
        service = build('searchconsole', 'v1', credentials=credentials)

        # Set date range (last 7 days, allowing for GSC latency)
        # GSC usually has a 2-3 day lag
        today = datetime.now()
        start_date = (today - timedelta(days=10)).strftime('%Y-%m-%d')
        end_date = (today - timedelta(days=3)).strftime('%Y-%m-%d')

        request = {
            'startDate': start_date,
            'endDate': end_date,
            'dimensions': ['query'],
            'rowLimit': 5
        }

        # Get totals (no dimensions)
        total_request = {
            'startDate': start_date,
            'endDate': end_date,
            'dimensions': ['device'] # Add a dimension to ensure rows are returned
        }
        
        totals = service.searchanalytics().query(siteUrl=SITE_URL, body=total_request).execute()
        rows = service.searchanalytics().query(siteUrl=SITE_URL, body=request).execute()

        clicks = 0
        impressions = 0
        if 'rows' in totals:
            for row in totals['rows']:
                clicks += int(row.get('clicks', 0))
                impressions += int(row.get('impressions', 0))

        top_queries = []
        if 'rows' in rows:
            for row in rows['rows']:
                top_queries.append({
                    "query": row['keys'][0],
                    "clicks": int(row.get('clicks', 0))
                })

        return {
            "clicks": clicks,
            "impressions": impressions,
            "top_queries": top_queries
        }
    except Exception as e:
        return {"error": str(e)}

if __name__ == "__main__":
    result = get_gsc_data()
    print(json.dumps(result, indent=2))
