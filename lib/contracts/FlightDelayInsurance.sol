// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract FlightDelayInsurance {
    struct Insurance {
        address userWallet;
        string flightNumber;
        uint256 premium;
        uint256 coverage;
        uint256 departureTime;
        uint256 arrivalTime;
        bool isActive;
        bool isClaimed;
    }

    // Use bookingId as the key for each insurance
    mapping(string => Insurance) public insurances;
    address public owner;
    uint256 public constant DELAY_THRESHOLD = 3 hours; // 3 hours delay threshold

    event InsurancePurchased(
        string bookingId,
        address userWallet,
        string flightNumber,
        uint256 premium,
        uint256 coverage,
        uint256 departureTime,
        uint256 arrivalTime
    );

    event InsuranceClaimed(string bookingId, address userWallet, uint256 payout);
    event Funded(address indexed from, uint256 amount);

    constructor() {
        owner = msg.sender;
    }

    modifier onlyOwner() {
        require(msg.sender == owner, "Only owner can call this function");
        _;
    }

    function purchaseInsurance(
        string memory bookingId,
        address userWallet,
        string memory flightNumber,
        uint256 departureTime,
        uint256 arrivalTime,
        uint256 premium,
        uint256 coverage
    ) external payable {
        require(msg.value == premium, "Incorrect premium amount");
        require(departureTime > block.timestamp, "Departure time must be in the future");
        require(arrivalTime > departureTime, "Invalid arrival time");
        require(coverage > premium, "Coverage must be greater than premium");
        require(insurances[bookingId].userWallet == address(0), "Insurance already exists for this booking");

        insurances[bookingId] = Insurance({
            userWallet: userWallet,
            flightNumber: flightNumber,
            premium: premium,
            coverage: coverage,
            departureTime: departureTime,
            arrivalTime: arrivalTime,
            isActive: true,
            isClaimed: false
        });

        emit InsurancePurchased(
            bookingId,
            userWallet,
            flightNumber,
            premium,
            coverage,
            departureTime,
            arrivalTime
        );
    }

    function isFlightDelayed(string memory bookingId) public view returns (bool) {
        Insurance memory insurance = insurances[bookingId];
        require(insurance.isActive, "Insurance not found or inactive");
        if (block.timestamp <= insurance.arrivalTime) {
            return false;
        }
        uint256 actualDelay = block.timestamp - insurance.arrivalTime;
        return actualDelay >= DELAY_THRESHOLD;
    }

    // Admin-only: trigger payout to user if delayed (for demo)
    function triggerPayout(string memory bookingId) external onlyOwner {
        Insurance storage insurance = insurances[bookingId];
        require(insurance.isActive, "Insurance not found or inactive");
        require(!insurance.isClaimed, "Insurance already claimed");
        require(isFlightDelayed(bookingId), "Flight is not delayed");
        insurance.isClaimed = true;
        insurance.isActive = false;
        payable(insurance.userWallet).transfer(insurance.coverage);
        emit InsuranceClaimed(bookingId, insurance.userWallet, insurance.coverage);
    }

    // Admin-only: Set arrivalTime for a booking (for demo/testing)
    function setArrivalTime(string memory bookingId, uint256 newArrivalTime) external onlyOwner {
        Insurance storage insurance = insurances[bookingId];
        require(insurance.isActive, "Insurance not found or inactive");
        insurance.arrivalTime = newArrivalTime;
    }

    // Admin-only: Set departureTime for a booking (for demo/testing)
    function setDepartureTime(string memory bookingId, uint256 newDepartureTime) external onlyOwner {
        Insurance storage insurance = insurances[bookingId];
        require(insurance.isActive, "Insurance not found or inactive");
        insurance.departureTime = newDepartureTime;
    }

    function getInsuranceDetails(string memory bookingId)
        external
        view
        returns (
            address userWallet,
            string memory flightNumber,
            uint256 premium,
            uint256 coverage,
            uint256 departureTime,
            uint256 arrivalTime,
            bool isActive,
            bool isClaimed
        )
    {
        Insurance memory insurance = insurances[bookingId];
        return (
            insurance.userWallet,
            insurance.flightNumber,
            insurance.premium,
            insurance.coverage,
            insurance.departureTime,
            insurance.arrivalTime,
            insurance.isActive,
            insurance.isClaimed
        );
    }

    function withdrawFunds() external onlyOwner {
        payable(owner).transfer(address(this).balance);
    }

    // Allow contract to receive ETH directly
    receive() external payable {
        emit Funded(msg.sender, msg.value);
    }
} 