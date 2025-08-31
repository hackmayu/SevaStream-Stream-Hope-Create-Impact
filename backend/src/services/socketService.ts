import { Server } from 'socket.io';

interface DonationStream {
  id: string;
  donor: string;
  recipient: string;
  amount: number;
  cause: string;
  status: 'active' | 'paused' | 'completed';
  startTime: Date;
}

let io: Server;
const activeStreams = new Map<string, DonationStream>();

export const initializeSocket = (socketServer: Server) => {
  io = socketServer;
  
  io.on('connection', (socket) => {
    console.log(`✅ Client connected: ${socket.id}`);
    
    // Send current active streams to new connection
    socket.emit('activeStreams', Array.from(activeStreams.values()));
    
    // Handle donation stream start
    socket.on('startDonationStream', (data) => {
      const { streamId, donor, recipient, amount, cause } = data;
      
      const stream: DonationStream = {
        id: streamId,
        donor,
        recipient,
        amount,
        cause,
        status: 'active',
        startTime: new Date()
      };
      
      activeStreams.set(streamId, stream);
      
      // Broadcast new stream to all clients
      io.emit('newDonationStream', stream);
      
      // Acknowledge to sender
      socket.emit('streamStarted', { streamId, status: 'active' });
      
      console.log(`💸 New donation stream started: ${streamId}`);
    });
    
    // Handle donation stream stop
    socket.on('stopDonationStream', (data) => {
      const { streamId } = data;
      
      const stream = activeStreams.get(streamId);
      if (stream) {
        stream.status = 'completed';
        activeStreams.delete(streamId);
        
        // Broadcast stream completion
        io.emit('donationStreamCompleted', stream);
        
        socket.emit('streamStopped', { streamId, status: 'completed' });
        
        console.log(`✅ Donation stream completed: ${streamId}`);
      }
    });
    
    // Handle real-time donation events
    socket.on('donationEvent', (data) => {
      const { type, streamId, amount, txHash } = data;
      
      // Broadcast donation event to all clients
      io.emit('realTimeDonation', {
        type,
        streamId,
        amount,
        txHash,
        timestamp: new Date().toISOString()
      });
      
      console.log(`💰 Donation event: ${type} - ₹${amount}`);
    });
    
    // Handle urgent need alerts
    socket.on('urgentNeedAlert', (data) => {
      const { needId, title, location, urgency, amount } = data;
      
      // Broadcast urgent need to all clients
      io.emit('urgentNeed', {
        needId,
        title,
        location,
        urgency,
        amount,
        timestamp: new Date().toISOString()
      });
      
      console.log(`🚨 Urgent need alert: ${title} in ${location}`);
    });
    
    // Handle client disconnect
    socket.on('disconnect', (reason) => {
      console.log(`❌ Client disconnected: ${socket.id} - ${reason}`);
    });
  });
  
  // Simulate real-time donation activity (for demo)
  if (process.env.NODE_ENV === 'development') {
    simulateRealTimeActivity();
  }
};

// Function to broadcast donation updates
export const broadcastDonationUpdate = (update: any) => {
  if (io) {
    io.emit('donationUpdate', update);
  }
};

// Function to broadcast analytics updates
export const broadcastAnalyticsUpdate = (analytics: any) => {
  if (io) {
    io.emit('analyticsUpdate', analytics);
  }
};

// Simulate real-time donation activity for demo
const simulateRealTimeActivity = () => {
  const causes = ['Medical Emergency', 'Clean Water', 'Food Security', 'Education', 'Disaster Relief'];
  const locations = ['Mumbai', 'Delhi', 'Bangalore', 'Chennai', 'Kolkata'];
  
  setInterval(() => {
    const donation = {
      donor: `0x${Math.random().toString(16).substr(2, 40)}`,
      amount: Math.floor(Math.random() * 50) + 8, // ₹8-58
      cause: causes[Math.floor(Math.random() * causes.length)],
      location: locations[Math.floor(Math.random() * locations.length)],
      txHash: `0x${Math.random().toString(16).substr(2, 64)}`,
      timestamp: new Date().toISOString()
    };
    
    if (io) {
      io.emit('realTimeDonation', donation);
    }
  }, 3000 + Math.random() * 7000); // Random interval between 3-10 seconds
};
