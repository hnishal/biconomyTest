// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;
import "@openzeppelin/contracts/metatx/ERC2771Context.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Counters.sol";

contract MyContract is ERC2771Context, Ownable {
    using Counters for Counters.Counter;
    Counters.Counter public _transactionCounter;
    address public trustedForwarder;

    constructor(address _trustedForwarder) ERC2771Context(_trustedForwarder) {
        trustedForwarder = _trustedForwarder;
    }

    function increment() external {
        _transactionCounter.increment();
    }

    function returnCounter() external view returns (uint256) {
        return _transactionCounter.current();
    }

    function _msgSender()
        internal
        view
        override(ERC2771Context, Context)
        returns (address sender)
    {
        if (isTrustedForwarder(msg.sender)) {
            // The assembly code is more direct than the Solidity version using `abi.decode`.
            /// @solidity memory-safe-assembly
            assembly {
                sender := shr(96, calldataload(sub(calldatasize(), 20)))
            }
        } else {
            return super._msgSender();
        }
    }

    function _msgData()
        internal
        view
        override(ERC2771Context, Context)
        returns (bytes calldata)
    {
        if (isTrustedForwarder(msg.sender)) {
            return msg.data[:msg.data.length - 20];
        } else {
            return super._msgData();
        }
    }
}
