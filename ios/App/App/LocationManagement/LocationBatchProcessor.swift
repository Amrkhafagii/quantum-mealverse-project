
import Foundation
import CoreLocation

class LocationBatchProcessor {
    private var pendingLocationUpdates: [CLLocation] = []
    private var batchProcessingTimer: Timer?
    private let batchSize: Int
    private let batchProcessingInterval: TimeInterval
    private var bestLocationHandler: ((CLLocation) -> Void)?
    
    init(batchSize: Int = 5, batchProcessingInterval: TimeInterval = 3.0) {
        self.batchSize = batchSize
        self.batchProcessingInterval = batchProcessingInterval
    }
    
    func setBestLocationHandler(_ handler: @escaping (CLLocation) -> Void) {
        self.bestLocationHandler = handler
    }
    
    func addToBatch(_ location: CLLocation) {
        pendingLocationUpdates.append(location)
        
        if batchProcessingTimer == nil {
            startBatchProcessingTimer()
        }
        
        // Process immediately if we reach batch size
        if pendingLocationUpdates.count >= batchSize {
            processBatchedLocations()
        }
    }
    
    private func startBatchProcessingTimer() {
        batchProcessingTimer = Timer.scheduledTimer(
            withTimeInterval: batchProcessingInterval,
            repeats: false
        ) { [weak self] _ in
            self?.processBatchedLocations()
        }
    }
    
    func stopBatchProcessingTimer() {
        batchProcessingTimer?.invalidate()
        batchProcessingTimer = nil
    }
    
    func processBatchedLocations() {
        guard !pendingLocationUpdates.isEmpty else { return }
        
        stopBatchProcessingTimer()
        
        // Find the best location in the batch
        let bestLocation = pendingLocationUpdates.reduce(pendingLocationUpdates[0]) { (best, current) in
            // Prefer newer locations
            if current.timestamp.timeIntervalSince(best.timestamp) > 5.0 {
                return current
            }
            
            // If timestamps are close, prefer more accurate
            return current.horizontalAccuracy < best.horizontalAccuracy ? current : best
        }
        
        // Update the best available location through the handler
        bestLocationHandler?(bestLocation)
        
        // Clear the batch
        pendingLocationUpdates.removeAll()
    }
    
    func clear() {
        pendingLocationUpdates.removeAll()
        stopBatchProcessingTimer()
    }
}
