<!-- RELEASE TESTNET v0.1.4 -->
<h1>
  <b>release-testnet-v0.1.5</b>
</h1>

<h2>Fixed bugs</h2>
<ul>
  <li>
The text font was changed to open Sans to match the mobile wallet.
  </li>
  <li>
      Create mosaics maximum decimals should be 6.
  </li>
  <li>Remove ability to add dots (.) in create namespace.</li>
  <li>Transfer type transaction, decimal separator was added to the amount.</li>
  <li>Add new logo ProximaX.</li>
  <li>Fixed, search in wallet does not work.</li>
  <li>Fixed, texts in "Link the namespace to an address".</li>
  <li>Show full address in dashboard transaction</li>
  <li>All buttons of the same size in services.</li>
  <li>Fixed, texts in "Create Mosaics".</li>
  <li>Removed dot (.) in select sub namespace</li>
  <li>Corrected texts in services</li>
  <li>Corrected texts in Link Namespace to a Mosaic</li>
  <li>Corrected texts in Link Namespace to a Created namespace & sub namespace</li>
  <li>Corrected texts in Account</li>
  <li>Replace all the names of the "clean" buttons with "clear"</li>
  <li>The notarization icon was changed</li>
  <li>The text font was changed to Open Sans to match the mobile wallet.</li>
  <li>The text of the footer was modified</li>
  <li>Removed ability to add capital letters in name of create namespace</li>
</ul>

<h2>Features</h2>
<ul>
  <li>Added the copy address button on the dashboard.</li>
  <li>Added account box in services</li>
  <li>Included block height in details form</li>
  <li>Included type transaction hex in dashboard and details transactions</li>
</ul>

<!-- RELEASE TESTNET v0.1.1 -->
<h1>
    <b>release-testnet-v0.1.1</b>
</h1>

<h2>Fixed bugs</h2>
<ul>
  <li> <b>#TransferService</b>: Fixed bugs in the transfer module when no contacts have been added</li>
</ul>

<h2>Features</h2>
<ul>
  <li> <b>#TransferService</b>: Added validation in amount / quantity, only positive numbers, do not allow negative numbers.</li>
  <li> <b>#TransferService</b>: the type of account in the recipient is validated by the network type</li>
  <li> <b>#TransferService</b>: Show Quantity of mosaic to be sent</li>
  <li> <b>#TransferService</b>: Validated that the amount or quantity to be transferred is not greater than my balance </li>
  <li> <b>#TransferService</b>: Removed tile reload button, add asynchronous function to recharge select mosaics</li>
  <li> <b>#TransferService</b>: Opened all websocket connections and filter hashes to know if there was an error in the transaction (Status, Confirmed, To be confirmed)</li> <br>
  <li> <b>#NamespaceService</b>: Opened all websocket connections and filter hashes to know if there was an error sending the transaction (Status, Confirmed, To be confirmed)</li>
  <li> <b>#NamespaceService</b>: If the Rental fee of the namespace is greater than my balance, block transaction shipping (Rental fee must not be greater than the quantity XPX)</li>
  <li> <b>#NamespaceService</b>: Validate availability of prx.xpx, if you do not have, block fields and show message.</li>
  <li> <b>#NamespaceService</b>: Deleted Reload Namespace button and add asynchronous function that returns Namespace </li>
  <li> <b>#NamespaceService</b>: Added the namespace rental fee</li>
  <li> <b>#NamespaceService</b>: The duration of the namespace per block was added </li>
  <li> <b>#NamespaceService</b>: Added the average duration calculation of the namespace by date </li>
</ul>

<!-- RELEASE TESTNET v0.0.5 -->
<h1>
  <b>release-testnet-v0.0.5</b>
</h1>

<h2>Supports and corrections</h2>

<ul>
  <li>
    Updated balance upon entering the wallet and upon confirmation of a transaction
  </li>
  <li>
    Bug support in the account module
  </li>
  <li>
    Optimization in the loading of the dashboard and compilation of the wallet.
  </li>
  <li>
    Mosaic bug support in transfer transaction
  </li>
</ul>

<!-- RELEASE TESTNET v0.0.4 -->
<h1>
    <b>release-testnet-v0.0.4</b>
</h1>

<ul>
  <li>
      Support for the creation and modification of mosaic
  </li>
  <li>
      Support for the creation and modification of namespace
  </li>
  <li>
      Optimization of the transaction dashboard:
      <ol>
          Correction of slowness when displaying transactions
      </ol>
      <ol>
          Transaction detail of type was added:
          <ol>
              Register namespace
          </ol>
          <ol>
              Mosaic supply change
          </ol>
          <ol>
              Mosaic definition
          </ol>
      </ol>
  </li>
  <li>
      Mosaics and namespace are temporarily stored in cache per session
  </li>
  <li>
      Change of UI in the wallet
  </li>
  <li>
      Mosaic selection added in the transfer module
  </li>
</ul>



<!-- RELEASE TESTNET v0.0.3 -->
<h1>
    <b>release-testnet-v0.0.3</b>
</h1>

<h2>Updates</h2>

<h4>TRANSACTION DASHBOARD:</h4>
<ul>
  <li>
    Duplication of confirmed and unconfirmed transactions was corrected.
  </li>
  <li>
    Mosaic divisibility was added to the amounts.
  </li>
  <li>
    Performance was improved.
  </li>
  <li>
    The initial load is when the user logs.
  </li>
  <li>
    Once logged, the transactions and mosaic information is cached.
  </li>
  <li>
    Once a new transaction is confirmed, it is added and saved in the cache.
  </li>
  <li>
    When the user logs off the wallet, all the information stored in cache is destroyed.
  </li>
</ul>

<h4>ADD AND SELECT NODE:</h4>

<ul>
  <li>
    There is a default node in a json file
  </li>
</ul>

<h4>ADD ADDRESS BOOK:</h4>

<ul>
  <li>The close button in the modal was added.</li>
  <li>
    The minimum of 6 characters to 2 characters was modified in the user field.
  </li>
</ul>



<h4>TRANSFER TRANSACTIONS:</h4>

<ul>
  <li>
    Once a transfer has been made, the address book is hidden

  </li>
</ul>


<h4>IMPORT ACCOUNT:</h4>

<ul>
  <li>
    Only the TEST_NET network was left
  </li>
</ul>
<h4>ACCOUNT:</h4>

<ul>
  <li>
    It was validated that the password field is not empty
  </li>
  <li>
    The password field is hidden when the private key is displayed, when the private key is closed, the password field
    is
    again displayed
  </li>
</ul>

